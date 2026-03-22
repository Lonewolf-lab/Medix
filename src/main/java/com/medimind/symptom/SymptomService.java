package com.medimind.symptom;

import com.medimind.symptom.dto.SymptomRequest;
import com.medimind.symptom.dto.SymptomTriageResponse;

import java.util.List;
import java.util.UUID;

public interface SymptomService {
    SymptomTriageResponse analyzeSymptoms(UUID userId, SymptomRequest request);
    List<SymptomLog> getSymptomHistory(UUID userId);
}
