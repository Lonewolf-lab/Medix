package com.medimind.ai;

import com.medimind.ai.dto.AIResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AIService {
    AIResponse analyzeSymptoms(List<String> symptoms, String additionalNotes, int userAge, String bloodGroup);
    Map<String, Object> parseSchedulePrompt(String userPrompt, LocalDate todayDate);
}
