package com.medimind.symptom.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomTriageResponse {
    private String severity;
    private List<String> possibleCauses;
    private String recommendation;
    private String disclaimer;
    private LocalDateTime timestamp;
}
