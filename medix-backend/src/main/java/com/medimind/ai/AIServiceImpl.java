package com.medimind.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.ai.dto.AIResponse;
import com.medimind.exception.AIServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIServiceImpl implements AIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String groqApiUrl;
    private final String groqApiKey;

    public AIServiceImpl(WebClient.Builder webClientBuilder,
                         ObjectMapper objectMapper,
                         @org.springframework.beans.factory.annotation.Value("${ai.api.url}") String geminiApiUrl,
                         @org.springframework.beans.factory.annotation.Value("${ai.api.key}") String geminiApiKey) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.groqApiUrl = geminiApiUrl;
        this.groqApiKey = geminiApiKey;
    }

    @SuppressWarnings("unchecked")
    @Override
    public AIResponse analyzeSymptoms(List<String> symptoms,
                                      String additionalNotes,
                                      int userAge,
                                      String bloodGroup) {
        try {
            String prompt = "You are a medical triage assistant. " +
                    "Patient age: " + userAge + ", Blood group: " +
                    (bloodGroup != null ? bloodGroup : "Unknown") + ". " +
                    "Symptoms: " + String.join(", ", symptoms) + ". " +
                    "Additional notes: " +
                    (additionalNotes != null && !additionalNotes.isBlank()
                            ? additionalNotes : "None") + ". " +
                    "Respond ONLY with a valid JSON object, no extra text, " +
                    "no markdown, no code blocks:\n" +
                    "{\n" +
                    "  \"severity\": \"LOW or MEDIUM or HIGH or URGENT\",\n" +
                    "  \"possibleCauses\": [\"cause1\", \"cause2\", \"cause3\"],\n" +
                    "  \"recommendation\": \"what the patient should do next\",\n" +
                    "  \"disclaimer\": \"This is not a medical diagnosis. Please consult a doctor.\"\n" +
                    "}";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("temperature", 0.3);

            System.out.println("Calling Groq API...");

            String responseStr = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), response ->
                            response.bodyToMono(String.class)
                                    .map(body -> {
                                        System.out.println("GROQ ERROR: " + body);
                                        return new RuntimeException("Groq API error: " + body);
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

            System.out.println("GROQ RESPONSE: " + responseStr);

            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");
            String jsonText = (String) message.get("content");

            jsonText = jsonText.trim();
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();
            }

            System.out.println("PARSED JSON: " + jsonText);

            return objectMapper.readValue(jsonText, AIResponse.class);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("FULL ERROR: " + e.getMessage());
            throw new AIServiceException("Failed to analyze symptoms: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public Map<String, Object> parseSchedulePrompt(String userPrompt, LocalDate todayDate) {
        try {
            LocalDate today = todayDate != null ? todayDate : LocalDate.now();

            String systemPrompt = "You are an AI medical schedule & reminder intent parser. " +
                    "Today's date is: " + today + ". " +
                    "Analyze the user's natural language input and determine their exact intent.\n" +
                    "Return ONLY a raw valid JSON object (no markdown, no ``` json, no extra commentary) matching this schema:\n" +
                    "{\n" +
                    "  \"intentType\": \"CREATE_APPOINTMENT or CREATE_MEDICATION or DELETE_MEDICATION or DELETE_APPOINTMENT or EDIT_MEDICATION_TIMINGS or UNKNOWN\",\n" +
                    "  \"doctorName\": \"Dr. Name or null\",\n" +
                    "  \"specialty\": \"Specialty or null\",\n" +
                    "  \"appointmentTime\": \"YYYY-MM-DDTHH:mm:ss or null\",\n" +
                    "  \"medicationName\": \"Medication Name or null\",\n" +
                    "  \"dosage\": \"Dosage e.g. 500mg or 1 tablet or null\",\n" +
                    "  \"frequency\": \"ONCE_DAILY or TWICE_DAILY or THREE_TIMES_DAILY or WEEKLY or AS_NEEDED\",\n" +
                    "  \"startDate\": \"YYYY-MM-DD or null (default to today: " + today + ")\",\n" +
                    "  \"endDate\": \"YYYY-MM-DD or null (compute based on requested duration e.g. 3 weeks from start date)\",\n" +
                    "  \"reminderTimes\": [\"10:00\", \"19:00\"],\n" +
                    "  \"notes\": \"Any extra notes or instructions or null\"\n" +
                    "}\n" +
                    "Rules:\n" +
                    "1. If prompt asks to schedule, book, or add a doctor/physician visit, set intentType='CREATE_APPOINTMENT'. Format appointmentTime using today's context (" + today + ").\n" +
                    "2. If prompt asks to delete, cancel, remove, stop, or drop a doctor visit/appointment, set intentType='DELETE_APPOINTMENT'. Extract doctorName.\n" +
                    "3. If prompt asks to add, log, create, or start a new medicine/prescription/reminder, set intentType='CREATE_MEDICATION'. Default startDate to " + today + ". If duration is specified, compute endDate.\n" +
                    "4. If prompt asks to remove, delete, stop, deactivate, or drop a medicine/prescription (e.g., 'remove the zinkuf-dx medication'), set intentType='DELETE_MEDICATION'. Extract medicationName.\n" +
                    "5. If prompt asks to edit, update, change, or modify timings/reminders of an existing medicine (e.g., 'edit the timings of zinkuf-dx to 11:50 AM and 7:30 PM'), set intentType='EDIT_MEDICATION_TIMINGS'. Extract medicationName and reminderTimes.\n" +
                    "6. Extract all reminder times in 24-hour 'HH:mm' format (e.g. 11:50 AM -> '11:50', 7:30 PM -> '19:30').\n" +
                    "7. For general questions or unclear actions, set intentType='UNKNOWN'.\n\n" +
                    "User Input: \"" + userPrompt + "\"";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", systemPrompt)
            ));
            requestBody.put("temperature", 0.1);

            String responseStr = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String jsonText = (String) message.get("content");

            jsonText = jsonText.trim();
            int startIdx = jsonText.indexOf("{");
            int endIdx = jsonText.lastIndexOf("}");
            if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                jsonText = jsonText.substring(startIdx, endIdx + 1);
            }

            return objectMapper.readValue(jsonText, Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("AI parseSchedulePrompt ERROR: " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("intentType", "UNKNOWN");
            return fallback;
        }
    }
}