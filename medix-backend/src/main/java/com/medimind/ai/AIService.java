package com.medimind.ai;

import com.medimind.ai.dto.AIResponse;
import java.util.List;

public interface AIService {
    AIResponse analyzeSymptoms(List<String> symptoms, String additionalNotes, int userAge, String bloodGroup);
}
