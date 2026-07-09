package com.medimind.dashboard;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.chat.ChatMessage;
import com.medimind.chat.ChatRepository;
import com.medimind.chat.dto.ChatResponse;
import com.medimind.dashboard.dto.BiomarkerChatRequest;
import com.medimind.dashboard.dto.BiomarkerValue;
import com.medimind.dashboard.dto.DashboardReportResponse;
import com.medimind.dashboard.dto.DashboardSummaryResponse;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.medication.Medication;
import com.medimind.medication.MedicationRepository;
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
public class DashboardServiceImpl implements DashboardService {

    private final DashboardReportRepository dashboardReportRepository;
    private final UserRepository userRepository;
    private final DashboardStorageService dashboardStorageService;
    private final ChatRepository chatRepository;
    private final MedicationRepository medicationRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.key}")
    private String groqApiKey;

    @Value("${ai.api.url}")
    private String groqApiUrl;

    public DashboardServiceImpl(
            DashboardReportRepository dashboardReportRepository,
            UserRepository userRepository,
            DashboardStorageService dashboardStorageService,
            ChatRepository chatRepository,
            MedicationRepository medicationRepository,
            WebClient anthropicWebClient,
            ObjectMapper objectMapper) {
        this.dashboardReportRepository = dashboardReportRepository;
        this.userRepository = userRepository;
        this.dashboardStorageService = dashboardStorageService;
        this.chatRepository = chatRepository;
        this.medicationRepository = medicationRepository;
        this.webClient = anthropicWebClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public DashboardReportResponse uploadReport(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fileUrl = dashboardStorageService.store(file);
        String contentType = file.getContentType();
        String extractedText = null;

        if ("application/pdf".equals(contentType)) {
            try (InputStream is = file.getInputStream();
                 PDDocument document = org.apache.pdfbox.Loader.loadPDF(is.readAllBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            } catch (Exception e) {
                System.err.println("Failed to extract text from PDF: " + e.getMessage());
            }
        }

        String systemPrompt = "You are a medical report analyzer specializing in extracting biomarker values from lab reports.\n" +
                "Analyze the provided report and respond ONLY with valid JSON, no extra text, no markdown, no code blocks:\n" +
                "{\n" +
                "  \"biomarkers\": [\n" +
                "    {\n" +
                "      \"parameter\": \"exact parameter name from report\",\n" +
                "      \"value\": \"numeric value as string\",\n" +
                "      \"unit\": \"unit of measurement\",\n" +
                "      \"normalRange\": \"normal reference range\",\n" +
                "      \"status\": \"NORMAL or HIGH or LOW or ABNORMAL\",\n" +
                "      \"explanation\": \"one sentence plain English explanation\",\n" +
                "      \"category\": \"LIPID or BLOOD_SUGAR or CBC or LIVER or KIDNEY or THYROID or VITAMIN or OTHER\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"totalBiomarkers\": number,\n" +
                "  \"abnormalCount\": number,\n" +
                "  \"normalCount\": number,\n" +
                "  \"overallAssessment\": \"brief overall health assessment\",\n" +
                "  \"disclaimer\": \"This is for informational purposes only. Please consult your doctor.\"\n" +
                "}";

        List<Map<String, Object>> messages;
        String modelName;

        if (extractedText != null && !extractedText.trim().isEmpty()) {
            modelName = "llama-3.3-70b-versatile";
            messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", "Extract all biomarker values from this lab report:\n" + extractedText)
            );
        } else {
            modelName = "llama-3.2-11b-vision-preview";
            byte[] imageBytes = dashboardStorageService.readFile(fileUrl);
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            String mimeType = fileUrl.endsWith(".png") ? "image/png" : "image/jpeg";
            
            messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", List.of(
                            Map.of("type", "image_url", "image_url", Map.of("url", "data:" + mimeType + ";base64," + base64)),
                            Map.of("type", "text", "text", "Extract all biomarker values from this lab report image.")
                    ))
            );
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

        String jsonText = null;
        try {
            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            jsonText = ((String) messageObj.get("content")).trim();

            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }

        dashboardReportRepository.updateIsLatestFalseForUser(userId);

        DashboardReport report = DashboardReport.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .extractedText(extractedText)
                .biomarkersJson(jsonText)
                .isLatest(true)
                .uploadedAt(LocalDateTime.now())
                .build();
        
        DashboardReport savedReport = dashboardReportRepository.save(report);

        int totalBiomarkers = 0;
        int abnormalCount = 0;
        try {
            Map<String, Object> parsedJson = objectMapper.readValue(jsonText, Map.class);
            if (parsedJson.containsKey("totalBiomarkers")) {
                totalBiomarkers = ((Number) parsedJson.get("totalBiomarkers")).intValue();
            }
            if (parsedJson.containsKey("abnormalCount")) {
                abnormalCount = ((Number) parsedJson.get("abnormalCount")).intValue();
            }
        } catch (Exception ignored) {}

        return DashboardReportResponse.builder()
                .id(savedReport.getId())
                .fileName(savedReport.getFileName())
                .fileUrl(savedReport.getFileUrl())
                .isLatest(savedReport.isLatest())
                .uploadedAt(savedReport.getUploadedAt())
                .totalBiomarkers(totalBiomarkers)
                .abnormalCount(abnormalCount)
                .build();
    }

    @Override
    public DashboardSummaryResponse getHealthSummary(UUID userId) {
        List<DashboardReport> reports = new java.util.ArrayList<>(dashboardReportRepository.findByUserIdOrderByUploadedAtDesc(userId));
        if (reports.isEmpty()) {
            throw new ResourceNotFoundException("No health report uploaded yet");
        }

        // Sort in Java: handle null uploadedAt values (nulls treated as oldest, put last in descending sort)
        reports.sort((a, b) -> {
            if (a.getUploadedAt() == null && b.getUploadedAt() == null) return 0;
            if (a.getUploadedAt() == null) return 1;
            if (b.getUploadedAt() == null) return -1;
            return b.getUploadedAt().compareTo(a.getUploadedAt());
        });

        System.out.println("DEBUG: getHealthSummary - sorted reports count: " + reports.size());
        for (DashboardReport r : reports) {
            System.out.println("DEBUG: Sorted Report ID: " + r.getId() + ", File: " + r.getFileName() + ", UploadedAt: " + r.getUploadedAt() + ", isLatest: " + r.isLatest());
        }

        DashboardReport latestReport = reports.get(0);
        List<DashboardReport> chronologicalReports = new java.util.ArrayList<>(reports);
        java.util.Collections.reverse(chronologicalReports);

        Map<String, BiomarkerValue> mergedMap = new java.util.LinkedHashMap<>();
        String overallAssessment = "";
        String disclaimer = "";

        for (DashboardReport r : chronologicalReports) {
            try {
                Map<String, Object> parsedJson = objectMapper.readValue(r.getBiomarkersJson(), Map.class);
                List<BiomarkerValue> biomarkersList = objectMapper.convertValue(
                        parsedJson.get("biomarkers"),
                        new TypeReference<List<BiomarkerValue>>() {}
                );

                if (biomarkersList != null) {
                    for (BiomarkerValue bio : biomarkersList) {
                        if (bio.getParameter() != null) {
                            mergedMap.put(bio.getParameter().trim().toLowerCase(), bio);
                        }
                    }
                }

                if (r.getId().equals(latestReport.getId())) {
                    overallAssessment = (String) parsedJson.get("overallAssessment");
                    disclaimer = (String) parsedJson.get("disclaimer");
                }
            } catch (Exception ignored) {}
        }

        List<BiomarkerValue> mergedBiomarkers = new java.util.ArrayList<>(mergedMap.values());
        int abnormalCount = 0;
        int normalCount = 0;

        for (BiomarkerValue bio : mergedBiomarkers) {
            String status = bio.getStatus() != null ? bio.getStatus().toUpperCase() : "NORMAL";
            if (status.equals("HIGH") || status.equals("LOW") || status.equals("ABNORMAL")) {
                abnormalCount++;
            } else {
                normalCount++;
            }
        }

        return DashboardSummaryResponse.builder()
                .reportId(latestReport.getId())
                .fileName(latestReport.getFileName())
                .uploadedAt(latestReport.getUploadedAt())
                .biomarkers(mergedBiomarkers)
                .totalBiomarkers(mergedBiomarkers.size())
                .abnormalCount(abnormalCount)
                .normalCount(normalCount)
                .overallAssessment(overallAssessment)
                .disclaimer(disclaimer)
                .build();
    }

    @Override
    public List<DashboardReportResponse> getAllReports(UUID userId) {
        return dashboardReportRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(r -> {
                    int total = 0, abnormal = 0;
                    try {
                        Map<String, Object> json = objectMapper.readValue(r.getBiomarkersJson(), Map.class);
                        total = ((Number) json.getOrDefault("totalBiomarkers", 0)).intValue();
                        abnormal = ((Number) json.getOrDefault("abnormalCount", 0)).intValue();
                    } catch (Exception ignored) {}
                    return DashboardReportResponse.builder()
                            .id(r.getId())
                            .fileName(r.getFileName())
                            .fileUrl(r.getFileUrl())
                            .isLatest(r.isLatest())
                            .uploadedAt(r.getUploadedAt())
                            .totalBiomarkers(total)
                            .abnormalCount(abnormal)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReport(UUID userId, UUID reportId) {
        DashboardReport report = dashboardReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (!report.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this report");
        }

        boolean wasLatest = report.isLatest();
        dashboardReportRepository.delete(report);

        if (wasLatest) {
            List<DashboardReport> remaining = dashboardReportRepository.findByUserIdOrderByUploadedAtDesc(userId);
            if (!remaining.isEmpty()) {
                DashboardReport nextLatest = remaining.get(0);
                nextLatest.setLatest(true);
                dashboardReportRepository.save(nextLatest);
            }
        }
    }

    @Override
    @Transactional
    public ChatResponse sendBiomarkerChatMessage(UUID userId, BiomarkerChatRequest request) {
        DashboardReport report = dashboardReportRepository.findByUserIdAndIsLatestTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No active health report found"));

        User user = report.getUser();

        ChatMessage userMessage = ChatMessage.builder()
                .user(user)
                .role("user")
                .content(request.getMessage())
                .recordId(report.getId())
                .build();
        chatRepository.save(userMessage);

        String overallAssessment = "";
        String normalRange = "";
        try {
            Map<String, Object> parsedJson = objectMapper.readValue(report.getBiomarkersJson(), Map.class);
            overallAssessment = (String) parsedJson.get("overallAssessment");
            List<Map<String, Object>> biomarkers = (List<Map<String, Object>>) parsedJson.get("biomarkers");
            for (Map<String, Object> b : biomarkers) {
                if (request.getBiomarkerName().equals(b.get("parameter"))) {
                    normalRange = (String) b.get("normalRange");
                    break;
                }
            }
        } catch (Exception ignored) {}

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

        String systemPrompt = String.format(
                "You are Medix AI, a personal health assistant. A patient is asking about a specific biomarker value from their latest lab report.\n\n" +
                "Patient Profile:\n" +
                "- Age: %s years\n" +
                "- Blood Group: %s\n\n" +
                "Current Active Medications:\n%s\n\n" +
                "Biomarker Being Discussed:\n" +
                "- Parameter: %s\n" +
                "- Value: %s\n" +
                "- Status: %s\n" +
                "- Normal Range: %s\n\n" +
                "Full Report Summary:\n%s\n\n" +
                "Answer the patient's question about this specific biomarker. Be specific, reference their exact value, explain what it means for their health, and suggest actionable steps if the value is abnormal. Always advise consulting a doctor for medical decisions.",
                age, bloodGroup, medsBuilder.toString().trim(),
                request.getBiomarkerName(), request.getBiomarkerValue(), request.getBiomarkerStatus(), normalRange,
                overallAssessment
        );

        List<ChatMessage> history = chatRepository.findTop10ByUserIdAndRecordIdOrderByTimestampDesc(userId, report.getId());
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
            aiResponseText = "I'm having trouble analyzing this biomarker chat context right now. Please try again.";
        }

        ChatMessage aiMessage = ChatMessage.builder()
                .user(user)
                .role("assistant")
                .content(aiResponseText)
                .recordId(report.getId())
                .build();
        ChatMessage savedAiMessage = chatRepository.save(aiMessage);

        return ChatResponse.builder()
                .id(savedAiMessage.getId())
                .role(savedAiMessage.getRole())
                .content(savedAiMessage.getContent())
                .timestamp(savedAiMessage.getTimestamp())
                .build();
    }
}
