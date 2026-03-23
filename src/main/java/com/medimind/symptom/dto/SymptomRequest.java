package com.medimind.symptom.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomRequest {

    @NotEmpty(message = "Symptoms list cannot be empty")
    private List<String> symptoms;

    private String additionalNotes;
}
