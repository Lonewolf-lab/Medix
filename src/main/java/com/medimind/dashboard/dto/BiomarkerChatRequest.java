package com.medimind.dashboard.dto;

import jakarta.validation.constraints.NotBlank;

public class BiomarkerChatRequest {
    
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    private String biomarkerName;
    private String biomarkerValue;
    private String biomarkerStatus;

    public BiomarkerChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getBiomarkerName() { return biomarkerName; }
    public void setBiomarkerName(String biomarkerName) { this.biomarkerName = biomarkerName; }
    public String getBiomarkerValue() { return biomarkerValue; }
    public void setBiomarkerValue(String biomarkerValue) { this.biomarkerValue = biomarkerValue; }
    public String getBiomarkerStatus() { return biomarkerStatus; }
    public void setBiomarkerStatus(String biomarkerStatus) { this.biomarkerStatus = biomarkerStatus; }
}
