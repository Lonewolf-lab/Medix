package com.medimind.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.chat.dto.ChatRequest;
import com.medimind.chat.dto.ChatResponse;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.medication.Medication;
import com.medimind.medication.MedicationRepository;
import com.medimind.symptom.SymptomLog;
import com.medimind.symptom.SymptomRepository;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.Period;
import com.medimind.dashboard.DashboardReportRepository;
import com.medimind.dashboard.DashboardReport;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final MedicationRepository medicationRepository;
    private final SymptomRepository symptomRepository;
    private final DashboardReportRepository dashboardReportRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.key}")
    private String groqApiKey;

    @Value("${ai.api.url}")
    private String groqApiUrl;

    public ChatServiceImpl(ChatRepository chatRepository,
                           UserRepository userRepository,
                           MedicationRepository medicationRepository,
                           SymptomRepository symptomRepository,
                           DashboardReportRepository dashboardReportRepository,
                           WebClient.Builder webClientBuilder,
                           ObjectMapper objectMapper) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.medicationRepository = medicationRepository;
        this.symptomRepository = symptomRepository;
        this.dashboardReportRepository = dashboardReportRepository;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ChatResponse sendMessage(UUID userId, ChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Save user message immediately
        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .role("user")
                .content(request.getMessage())
                .build();
        chatRepository.save(userMessage);

        // Extract pinned biomarkers if passed in request or formatted string
        List<String> pinnedBiomarkers = request.getPinnedBiomarkers();
        if ((pinnedBiomarkers == null || pinnedBiomarkers.isEmpty()) && request.getMessage() != null && request.getMessage().startsWith("[Biomarker Context:")) {
            try {
                int endIdx = request.getMessage().indexOf("]");
                if (endIdx > 19) {
                    String contextText = request.getMessage().substring(19, endIdx);
                    String[] parts = contextText.split(",");
                    pinnedBiomarkers = new ArrayList<>();
                    for (String p : parts) {
                        String[] pair = p.trim().split(":");
                        if (pair.length > 0 && !pair[0].trim().isEmpty()) {
                            pinnedBiomarkers.add(pair[0].trim());
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 2. Fetch context
        String systemPrompt = buildSystemPrompt(user, pinnedBiomarkers);

        // 3. Fetch history (excluding the one we just saved to avoid duplication in history array, 
        // though we can just fetch top 10 including it and reverse)
        List<ChatMessage> history = chatRepository.findTop10ByUserIdOrderByTimestampDesc(userId);
        Collections.reverse(history); // chronological order

        // 4. Build Groq API request
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (ChatMessage msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.3-70b-versatile");
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 1024);

        // 5. Call API
        String aiResponseText;
        try {
            String responseStr = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            aiResponseText = (String) messageObj.get("content");
        } catch (Exception e) {
            aiResponseText = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
        }

        // 6. Save AI response
        ChatMessage aiMessage = ChatMessage.builder()
                .user(user)
                .role("assistant")
                .content(aiResponseText)
                .build();
        ChatMessage savedAiMessage = chatRepository.save(aiMessage);

        return toResponse(savedAiMessage);
    }

    @Override
    public List<ChatResponse> getChatHistory(UUID userId) {
        return chatRepository.findByUserIdOrderByTimestampAsc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearChatHistory(UUID userId) {
        chatRepository.deleteByUserId(userId);
    }

    private String buildSystemPrompt(User user, List<String> pinnedBiomarkers) {
        // Profile
        String name = user.getName() != null ? user.getName() : "Unknown";
        String age = user.getDob() != null ? String.valueOf(Period.between(user.getDob(), LocalDate.now()).getYears()) : "Unknown";
        String bloodGroup = user.getBloodGroup() != null ? user.getBloodGroup() : "Unknown";

        // Medications
        List<Medication> activeMeds = medicationRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(user.getId());
        StringBuilder medsBuilder = new StringBuilder();
        if (activeMeds.isEmpty()) {
            medsBuilder.append("None");
        } else {
            for (Medication m : activeMeds) {
                medsBuilder.append("- ").append(m.getName())
                        .append(" ").append(m.getDosage() != null ? m.getDosage() : "")
                        .append(" (").append(m.getFrequency() != null ? m.getFrequency().name() : "As directed").append(")\n");
            }
        }

        // Symptoms
        List<SymptomLog> recentSymptoms = symptomRepository.findByUserIdOrderByTimestampDesc(user.getId());
        int limit = Math.min(3, recentSymptoms.size());
        StringBuilder sympBuilder = new StringBuilder();
        if (limit == 0) {
            sympBuilder.append("None");
        } else {
            for (int i = 0; i < limit; i++) {
                SymptomLog log = recentSymptoms.get(i);
                String symptomsStr = log.getSymptoms() != null ? String.join(", ", log.getSymptoms()) : "Unknown";
                sympBuilder.append("- ").append(symptomsStr)
                        .append(" | Severity: ").append(log.getSeverity() != null ? log.getSeverity() : "Unknown")
                        .append(" | Date: ").append(log.getTimestamp().toLocalDate()).append("\n");
            }
        }

        // Biomarkers (from latest lab report)
        boolean hasPinned = pinnedBiomarkers != null && !pinnedBiomarkers.isEmpty();
        StringBuilder biomarkersBuilder = new StringBuilder();
        Optional<DashboardReport> latestReportOpt = dashboardReportRepository.findByUserIdAndIsLatestTrue(user.getId());
        if (latestReportOpt.isPresent()) {
            try {
                DashboardReport report = latestReportOpt.get();
                Map<String, Object> parsedJson = objectMapper.readValue(report.getBiomarkersJson(), Map.class);
                List<Map<String, Object>> biomarkers = (List<Map<String, Object>>) parsedJson.get("biomarkers");
                if (biomarkers != null && !biomarkers.isEmpty()) {
                    for (Map<String, Object> b : biomarkers) {
                        String param = (String) b.get("parameter");
                        if (hasPinned) {
                            boolean isPinned = pinnedBiomarkers.stream()
                                    .anyMatch(p -> p.equalsIgnoreCase(param) || (param != null && (param.toLowerCase().contains(p.toLowerCase()) || p.toLowerCase().contains(param.toLowerCase()))));
                            if (!isPinned) {
                                continue;
                            }
                        }
                        biomarkersBuilder.append("- ").append(param)
                                .append(": ").append(b.get("value"))
                                .append(" ").append(b.get("unit") != null ? b.get("unit") : "")
                                .append(" (Status: ").append(b.get("status"))
                                .append(", Range: ").append(b.get("normalRange") != null ? b.get("normalRange") : "N/A")
                                .append(")\n");
                    }
                }
                if (biomarkersBuilder.length() == 0) {
                    biomarkersBuilder.append("None");
                }
            } catch (Exception e) {
                biomarkersBuilder.append("None (Failed to parse biomarkers)");
            }
        } else {
            biomarkersBuilder.append("None (No lab report uploaded)");
        }

        String strictInstructionBlock;
        if (hasPinned) {
            strictInstructionBlock = String.format(
                "CRITICAL PINNED BIOMARKER DIRECTIVE:\n" +
                "The patient has explicitly attached/pinned specific biomarkers for discussion: %s.\n" +
                "You MUST restrict your medical analysis, health explanations, and recommendations EXCLUSIVELY to these pinned biomarkers.\n" +
                "Do NOT mention, analyze, or bring up any unselected or unpinned biomarkers.\n\n",
                String.join(", ", pinnedBiomarkers)
            );
        } else {
            strictInstructionBlock = 
                "GENERAL RELEVANCE & CONTEXT DIRECTIVE:\n" +
                "1. If the user asks a health or medical question, answer using the patient's context above.\n" +
                "2. RELEVANCE GUARDRAIL: If the user asks a general, non-health question (e.g. coding, programming, general knowledge, casual greetings, math), answer directly and accurately. DO NOT force, shoehorn, or mention any health profile, blood group, or biomarker data unless the query is health-related.\n\n";
        }

        return String.format(
                "You are Medix AI, a personal health assistant.\n" +
                "You have access to the following patient health data:\n\n" +
                "Patient Profile:\n" +
                "- Name: %s\n" +
                "- Age: %s years\n" +
                "- Blood Group: %s\n\n" +
                "Current Active Medications:\n%s\n\n" +
                "Recent Symptom History (last 3 checks):\n%s\n\n" +
                "Latest Lab Report Biomarkers:\n%s\n\n" +
                "%s" +
                "Answer the user's questions in a clear, empathetic, and helpful manner.\n" +
                "Always remind the user to consult a doctor for serious medical concerns. Never provide a definitive medical diagnosis.\n" +
                "Keep responses concise and easy to understand.",
                name, age, bloodGroup, medsBuilder.toString().trim(), sympBuilder.toString().trim(), biomarkersBuilder.toString().trim(),
                strictInstructionBlock
        );
    }

    private ChatResponse toResponse(ChatMessage message) {
        return ChatResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }
}
