package com.medimind.record;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.chat.ChatMessage;
import com.medimind.chat.ChatRepository;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.medication.Medication;
import com.medimind.medication.MedicationRepository;
import com.medimind.record.dto.DocumentAnalysisResponse;
import com.medimind.record.dto.DocumentChatRequest;
import com.medimind.record.dto.DocumentChatResponse;
import com.medimind.record.dto.HealthRecordRequest;
import com.medimind.record.dto.HealthRecordResponse;
import com.medimind.storage.StorageService;
import com.medimind.symptom.SymptomRepository;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HealthRecordServiceImpl implements HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ChatRepository chatRepository;
    private final MedicationRepository medicationRepository;
    private final SymptomRepository symptomRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.key}")
    private String groqApiKey;

    @Value("${ai.api.url}")
    private String groqApiUrl;

    public HealthRecordServiceImpl(HealthRecordRepository healthRecordRepository, 
                                   UserRepository userRepository, 
                                   StorageService storageService,
                                   ChatRepository chatRepository,
                                   MedicationRepository medicationRepository,
                                   SymptomRepository symptomRepository,
                                   WebClient.Builder webClientBuilder,
                                   ObjectMapper objectMapper) {
        this.healthRecordRepository = healthRecordRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.chatRepository = chatRepository;
        this.medicationRepository = medicationRepository;
        this.symptomRepository = symptomRepository;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public List<HealthRecordResponse> getAllRecords(UUID userId) {
        return healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HealthRecordResponse getRecordById(UUID userId, UUID recordId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        return mapToResponse(record);
    }

    @Override
    public HealthRecordResponse createRecord(UUID userId, HealthRecordRequest request, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        HealthRecord record = HealthRecord.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .recordType(request.getRecordType())
                .recordDate(request.getRecordDate())
                .build();

        if (file != null && !file.isEmpty()) {
            String fileUrl = storageService.store(file);
            record.setFileUrl(fileUrl);
            record.setFileName(file.getOriginalFilename());
            record.setFileType(file.getContentType());

            if ("application/pdf".equals(file.getContentType())) {
                try (InputStream is = file.getInputStream();
                     PDDocument document = org.apache.pdfbox.Loader.loadPDF(is.readAllBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String extractedText = stripper.getText(document);
                    record.setExtractedText(extractedText);
                } catch (Exception e) {
                    System.err.println("Failed to extract text from PDF: " + e.getMessage());
                }
            }
        }

        HealthRecord savedRecord = healthRecordRepository.save(record);
        return mapToResponse(savedRecord);
    }

    @Override
    public HealthRecordResponse updateRecord(UUID userId, UUID recordId, HealthRecordRequest request) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);

        record.setTitle(request.getTitle());
        record.setDescription(request.getDescription());
        record.setRecordType(request.getRecordType());
        record.setRecordDate(request.getRecordDate());

        HealthRecord updatedRecord = healthRecordRepository.save(record);
        return mapToResponse(updatedRecord);
    }

    @Override
    public void deleteRecord(UUID userId, UUID recordId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        healthRecordRepository.delete(record);
    }

    @Override
    public List<HealthRecordResponse> getRecordsByType(UUID userId, RecordType recordType) {
        return healthRecordRepository.findByUserIdAndRecordType(userId, recordType)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- AI Document Analysis Methods ---

    @Override
    @Transactional
    public DocumentAnalysisResponse analyzeRecord(UUID recordId, UUID userId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);

        String systemPrompt = "You are a medical document analyst. Analyze the provided medical document and respond in this exact JSON format, no extra text, no markdown:\n" +
                "{\n" +
                "  \"summary\": \"brief 2-3 sentence summary of the document\",\n" +
                "  \"findings\": [\n" +
                "    {\n" +
                "      \"parameter\": \"parameter name\",\n" +
                "      \"value\": \"the value with unit\",\n" +
                "      \"status\": \"NORMAL or HIGH or LOW or ABNORMAL\",\n" +
                "      \"explanation\": \"plain English explanation\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"abnormalCount\": 0,\n" +
                "  \"overallAssessment\": \"overall health assessment\",\n" +
                "  \"suggestedQuestions\": [\n" +
                "    \"question 1 to ask doctor\",\n" +
                "    \"question 2 to ask doctor\"\n" +
                "  ],\n" +
                "  \"disclaimer\": \"This analysis is for informational purposes only. Please consult your doctor.\"\n" +
                "}";

        List<Map<String, Object>> messages;
        String modelName;

        if (record.getExtractedText() != null && !record.getExtractedText().trim().isEmpty()) {
            modelName = "llama-3.3-70b-versatile";
            messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", "Analyze this medical document:\n" + record.getExtractedText())
            );
        } else if (record.getFileUrl() != null && (record.getFileUrl().endsWith(".png") || record.getFileUrl().endsWith(".jpg") || record.getFileUrl().endsWith(".jpeg"))) {
            modelName = "meta-llama/llama-4-scout-17b-16e-instruct";
            byte[] imageBytes = storageService.readFile(record.getFileUrl());
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = record.getFileUrl().endsWith(".png") ? "image/png" : "image/jpeg";

            messages = List.of(
                    Map.of("role", "user", "content", List.of(
                            Map.of("type", "image_url", "image_url", Map.of("url", "data:" + mimeType + ";base64," + base64)),
                            Map.of("type", "text", "text", systemPrompt + "\n\nAnalyze this medical document image and extract all findings, values and their normal ranges.")
                    ))
            );
        } else {
            throw new IllegalArgumentException("Record cannot be analyzed: No text could be extracted and it is not a valid image format.");
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.1);

        String responseStr = webClient.post()
                .uri(groqApiUrl)
                .header("Authorization", "Bearer " + groqApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            String jsonText = ((String) messageObj.get("content")).trim();

            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            record.setAiAnalysis(objectMapper.writeValueAsString(objectMapper.readValue(jsonText, Object.class)));
            record.setUpdatedAt(LocalDateTime.now());
            healthRecordRepository.save(record);

            return toAnalysisResponse(record);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse analysis response from AI: " + e.getMessage());
        }
    }

    @Override
    public DocumentAnalysisResponse getRecordAnalysis(UUID recordId, UUID userId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        if (record.getAiAnalysis() == null) {
            throw new ResourceNotFoundException("Analysis not found for this record");
        }
        return toAnalysisResponse(record);
    }

    @Override
    @Transactional
    public DocumentChatResponse sendDocumentChatMessage(UUID recordId, UUID userId, DocumentChatRequest request) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        if (record.getAiAnalysis() == null) {
            throw new IllegalArgumentException("Please analyze this document first before chatting");
        }

        User user = record.getUser();

        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .role("user")
                .content(request.getMessage())
                .recordId(recordId)
                .build();
        chatRepository.save(userMessage);

        String systemPrompt = buildDocumentChatSystemPrompt(user, record);

        List<ChatMessage> history = chatRepository.findTop10ByUserIdAndRecordIdOrderByTimestampDesc(userId, recordId);
        Collections.reverse(history);

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
            aiResponseText = "I'm having trouble analyzing this document chat context right now. Please try again.";
        }

        ChatMessage aiMessage = ChatMessage.builder()
                .user(user)
                .role("assistant")
                .content(aiResponseText)
                .recordId(recordId)
                .build();
        ChatMessage savedAiMessage = chatRepository.save(aiMessage);

        return toDocumentChatResponse(savedAiMessage);
    }

    @Override
    public List<DocumentChatResponse> getDocumentChatHistory(UUID recordId, UUID userId) {
        getHealthRecordAndVerifyOwnership(userId, recordId);
        return chatRepository.findByUserIdAndRecordIdOrderByTimestampAsc(userId, recordId)
                .stream()
                .map(this::toDocumentChatResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearDocumentChatHistory(UUID recordId, UUID userId) {
        getHealthRecordAndVerifyOwnership(userId, recordId);
        chatRepository.deleteByUserIdAndRecordId(userId, recordId);
    }

    // --- Helpers ---

    private String buildDocumentChatSystemPrompt(User user, HealthRecord record) {
        String age = user.getDob() != null ? String.valueOf(Period.between(user.getDob(), LocalDate.now()).getYears()) : "Unknown";
        String bloodGroup = user.getBloodGroup() != null ? user.getBloodGroup() : "Unknown";

        List<Medication> activeMeds = medicationRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(user.getId());
        StringBuilder medsBuilder = new StringBuilder();
        if (activeMeds.isEmpty()) {
            medsBuilder.append("None");
        } else {
            for (Medication m : activeMeds) {
                medsBuilder.append("- ").append(m.getName()).append("\n");
            }
        }

        return String.format(
                "You are MediMind AI, a personal health assistant helping a patient understand their medical document.\n\n" +
                "Patient Profile:\n" +
                "- Age: %s years\n" +
                "- Blood Group: %s\n\n" +
                "Current Active Medications:\n%s\n" +
                "Document Being Discussed:\n" +
                "- Type: %s\n" +
                "- Title: %s\n\n" +
                "Document Analysis Summary:\n%s\n\n" +
                "Answer the patient's questions about this specific document in clear, simple language. Reference specific values from the document when relevant. Always remind the patient to consult their doctor for medical decisions.",
                age, bloodGroup, medsBuilder.toString().trim(),
                record.getRecordType().name(),
                record.getTitle(),
                record.getAiAnalysis()
        );
    }

    private DocumentAnalysisResponse toAnalysisResponse(HealthRecord record) {
        Object parsedAnalysis = null;
        try {
            if (record.getAiAnalysis() != null) {
                parsedAnalysis = objectMapper.readValue(record.getAiAnalysis(), Object.class);
            }
        } catch (Exception e) {
            parsedAnalysis = record.getAiAnalysis();
        }
        return DocumentAnalysisResponse.builder()
                .recordId(record.getId())
                .recordTitle(record.getTitle())
                .recordType(record.getRecordType())
                .analysis(parsedAnalysis)
                .analyzedAt(record.getUpdatedAt() != null ? record.getUpdatedAt() : record.getCreatedAt())
                .build();
    }

    private DocumentChatResponse toDocumentChatResponse(ChatMessage msg) {
        return DocumentChatResponse.builder()
                .id(msg.getId())
                .role(msg.getRole())
                .content(msg.getContent())
                .recordId(msg.getRecordId())
                .timestamp(msg.getTimestamp())
                .build();
    }

    private HealthRecord getHealthRecordAndVerifyOwnership(UUID userId, UUID recordId) {
        HealthRecord record = healthRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this record");
        }
        
        return record;
    }

    private HealthRecordResponse mapToResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
                .id(record.getId())
                .title(record.getTitle())
                .description(record.getDescription())
                .recordType(record.getRecordType())
                .fileUrl(record.getFileUrl())
                .fileName(record.getFileName())
                .fileType(record.getFileType())
                .aiAnalysis(record.getAiAnalysis())
                .recordDate(record.getRecordDate())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
