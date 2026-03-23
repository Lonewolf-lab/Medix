package com.medimind.ai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIResponse {
    private String severity;
    private List<String> possibleCauses;
    private String recommendation;
    private String disclaimer;
}
