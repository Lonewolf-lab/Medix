package com.medimind.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.ai.dto.AIResponse;
import com.medimind.exception.AIServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIServiceImpl implements AIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String groqApiUrl;
    private final String groqApiKey;

    public AIServiceImpl(WebClient anthropicWebClient,
                         ObjectMapper objectMapper,
                         String geminiApiUrl,
                         String geminiApiKey) {
        this.webClient = anthropicWebClient;
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
}