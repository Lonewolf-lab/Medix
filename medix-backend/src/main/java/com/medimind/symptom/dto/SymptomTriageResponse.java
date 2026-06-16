package com.medimind.symptom.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SymptomTriageResponse {
    private String severity;
    private List<String> possibleCauses;
    private String recommendation;
    private String disclaimer;
    private LocalDateTime timestamp;

    public SymptomTriageResponse() {}

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public List<String> getPossibleCauses() { return possibleCauses; }
    public void setPossibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SymptomTriageResponse obj = new SymptomTriageResponse();
        public Builder severity(String v)               { obj.severity = v; return this; }
        public Builder possibleCauses(List<String> v)   { obj.possibleCauses = v; return this; }
        public Builder recommendation(String v)         { obj.recommendation = v; return this; }
        public Builder disclaimer(String v)             { obj.disclaimer = v; return this; }
        public Builder timestamp(LocalDateTime v)       { obj.timestamp = v; return this; }
        public SymptomTriageResponse build()            { return obj; }
    }
}
