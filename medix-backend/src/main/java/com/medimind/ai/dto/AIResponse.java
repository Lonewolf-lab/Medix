package com.medimind.ai.dto;

import java.util.List;

public class AIResponse {
    private String severity;
    private List<String> possibleCauses;
    private String recommendation;
    private String disclaimer;

    public AIResponse() {}

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public List<String> getPossibleCauses() { return possibleCauses; }
    public void setPossibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
