package com.medimind.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiVisionService {

    private static final Logger log = LoggerFactory.getLogger(GeminiVisionService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String geminiApiUrl;
    private final String geminiApiKey;

    public GeminiVisionService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${gemini.api.url}") String geminiApiUrl,
            @Value("${gemini.api.key:}") String geminiApiKey) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.geminiApiUrl = geminiApiUrl;
        this.geminiApiKey = geminiApiKey;
    }

    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }

    /**
     * Extracts structured medication entries from a prescription image (handwritten or printed).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> extractPrescription(byte[] imageBytes, String mimeType) {
        if (!isConfigured()) {
            throw new IllegalStateException("Google Gemini API Key is not configured in application properties.");
        }

        String base64Data = Base64.getEncoder().encodeToString(imageBytes);
        String targetMimeType = (mimeType != null && mimeType.contains("png")) ? "image/png" : "image/jpeg";

        String clinicalPrompt = "You are an expert clinical pharmacist specializing in deciphering handwritten doctor prescriptions, clinic slips, and medical orders.\n" +
                "Carefully transcribe all medications prescribed in this image.\n" +
                "Decipher handwriting, medical abbreviations and dosage shorthand:\n" +
                "- OD / 1-0-0 -> ONCE_DAILY\n" +
                "- BD / BID / 1-0-1 -> TWICE_DAILY\n" +
                "- TDS / TID / 1-1-1 -> THREE_TIMES_DAILY\n" +
                "- QID / 1-1-1-1 -> FOUR_TIMES_DAILY\n" +
                "- HS / 0-0-1 -> ONCE_DAILY (At Bedtime)\n" +
                "- SOS / PRN -> AS_NEEDED\n" +
                "- PC -> After Meals, AC -> Before Meals\n" +
                "- Tab -> Tablet, Cap -> Capsule, Syp -> Syrup, Inj -> Injection\n\n" +
                "Return ONLY a valid raw JSON object strictly matching this schema with NO markdown code blocks:\n" +
                "{\n" +
                "  \"extractedMedications\": [\n" +
                "    {\n" +
                "      \"name\": \"Full drug brand/generic name with strength if present\",\n" +
                "      \"dosage\": \"e.g. 500mg, 1 tablet, 10ml, or null if unspecified\",\n" +
                "      \"frequency\": \"ONCE_DAILY or TWICE_DAILY or THREE_TIMES_DAILY or AS_NEEDED or null\",\n" +
                "      \"duration\": \"e.g. 5 days, 1 week, 1 month, or null\",\n" +
                "      \"notes\": \"any specific timing instructions (e.g. after meals, empty stomach)\",\n" +
                "      \"confidence\": \"HIGH or MEDIUM or LOW\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"rawExtractedText\": \"Full plain text transcription of doctor notes and prescription header\",\n" +
                "  \"totalFound\": 1,\n" +
                "  \"disclaimer\": \"Please verify all extracted information before saving\"\n" +
                "}";

        return callGeminiVision(base64Data, targetMimeType, clinicalPrompt);
    }

    /**
     * Extracts structured biomarkers and diagnostic findings from a medical report image or scanned lab panel.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> extractLabReport(byte[] imageBytes, String mimeType, boolean isLabReport) {
        if (!isConfigured()) {
            throw new IllegalStateException("Google Gemini API Key is not configured in application properties.");
        }

        String base64Data = Base64.getEncoder().encodeToString(imageBytes);
        String targetMimeType = (mimeType != null && mimeType.contains("png")) ? "image/png" : "image/jpeg";

        String prompt;
        if (isLabReport) {
            prompt = "You are an expert medical lab pathologist. Extract all biomarker parameters, measured values, reference ranges, and diagnostic evaluations from this lab report image.\n" +
                    "Return ONLY a valid raw JSON object strictly matching this schema with NO markdown code blocks:\n" +
                    "{\n" +
                    "  \"biomarkers\": [\n" +
                    "    {\n" +
                    "      \"parameter\": \"parameter name (e.g. Fasting Blood Sugar, Serum Creatinine, Hemoglobin, Total Calcium)\",\n" +
                    "      \"value\": \"numeric or qualitative measured value\",\n" +
                    "      \"unit\": \"unit of measurement (e.g. mg/dL, g/dL, %)\",\n" +
                    "      \"referenceRange\": \"normal reference range interval (e.g. 70-100 mg/dL)\",\n" +
                    "      \"status\": \"NORMAL or HIGH or LOW or BORDERLINE or ABNORMAL\",\n" +
                    "      \"explanation\": \"brief plain-English explanation of this reading\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"totalBiomarkers\": 1,\n" +
                    "  \"abnormalCount\": 0,\n" +
                    "  \"normalCount\": 1,\n" +
                    "  \"overallAssessment\": \"concise clinical summary of the patient's lab findings\",\n" +
                    "  \"disclaimer\": \"This analysis is for informational purposes only. Please consult your doctor.\"\n" +
                    "}";
        } else {
            prompt = "You are an expert clinical medical analyst. Analyze this medical document or prescription image.\n" +
                    "Return ONLY a valid raw JSON object strictly matching this schema with NO markdown code blocks:\n" +
                    "{\n" +
                    "  \"documentType\": \"Prescription / Radiology Report / Discharge Summary / Clinical Note\",\n" +
                    "  \"summary\": \"clear structured clinical summary of findings, diagnoses, or prescribed medications\",\n" +
                    "  \"findings\": [\n" +
                    "    {\n" +
                    "      \"parameter\": \"Prescribed Medication / Clinical Observation Name\",\n" +
                    "      \"value\": \"Dosage / Frequency / Duration\",\n" +
                    "      \"status\": \"NORMAL\",\n" +
                    "      \"explanation\": \"Timing, food instructions, or observation details\"\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"abnormalCount\": 0,\n" +
                    "  \"overallAssessment\": \"overall prescription / document assessment\",\n" +
                    "  \"suggestedQuestions\": [\n" +
                    "    \"How should I take these medications?\",\n" +
                    "    \"Are there any potential drug interactions with my current routine?\"\n" +
                    "  ],\n" +
                    "  \"disclaimer\": \"This analysis is for informational purposes only. Please consult your doctor or pharmacist.\"\n" +
                    "}";
        }

        return callGeminiVision(base64Data, targetMimeType, prompt);
    }

    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash"
    );

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGeminiVision(String base64Data, String mimeType, String prompt) {
        Map<String, Object> requestPayload = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of(
                                                "inline_data", Map.of(
                                                        "mime_type", mimeType,
                                                        "data", base64Data
                                                )
                                        ),
                                        Map.of(
                                                "text", prompt
                                        )
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "response_mime_type", "application/json",
                        "temperature", 0.1
                )
        );

        Exception lastException = null;

        java.util.List<String> modelsToTry = new java.util.ArrayList<>(FALLBACK_MODELS);
        String configuredModel = extractModelFromUrl(geminiApiUrl);
        if (configuredModel != null && !modelsToTry.contains(configuredModel)) {
            modelsToTry.add(0, configuredModel);
        } else if (configuredModel != null) {
            modelsToTry.remove(configuredModel);
            modelsToTry.add(0, configuredModel);
        }

        for (String model : modelsToTry) {
            try {
                String targetUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + geminiApiKey;
                log.info("Dispatching image to Gemini Vision model: {}", model);

                String responseStr = webClient.post()
                        .uri(targetUrl)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestPayload)
                        .retrieve()
                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response ->
                                response.bodyToMono(String.class)
                                        .map(body -> {
                                            log.warn("Gemini Vision model {} returned error: {}", model, body);
                                            return new RuntimeException("Gemini Vision API error [" + model + "]: " + body);
                                        })
                        )
                        .bodyToMono(String.class)
                        .block();

                Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates == null || candidates.isEmpty()) {
                    throw new RuntimeException("No candidates returned from Gemini Vision API for model " + model);
                }

                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                String rawJson = (String) parts.get(0).get("text");

                rawJson = rawJson.trim();
                if (rawJson.startsWith("```")) {
                    rawJson = rawJson.replaceAll("```json", "").replaceAll("```", "").trim();
                }

                return objectMapper.readValue(rawJson, Map.class);

            } catch (Exception e) {
                log.warn("Gemini Vision attempt failed with model {}: {}. Attempting fallback model...", model, e.getMessage());
                lastException = e;
            }
        }

        throw new RuntimeException("All Gemini Vision models failed: " + (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }

    private String extractModelFromUrl(String url) {
        if (url == null) return null;
        try {
            int modelsIdx = url.indexOf("/models/");
            int colonIdx = url.indexOf(":", modelsIdx);
            if (modelsIdx != -1 && colonIdx != -1) {
                return url.substring(modelsIdx + "/models/".length(), colonIdx);
            }
        } catch (Exception ignored) {}
        return null;
    }
}