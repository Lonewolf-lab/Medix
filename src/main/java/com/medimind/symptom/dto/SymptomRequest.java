package com.medimind.symptom.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class SymptomRequest {

    @NotEmpty(message = "Symptoms list cannot be empty")
    private List<String> symptoms;

    private String additionalNotes;

    public SymptomRequest() {}

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
}
