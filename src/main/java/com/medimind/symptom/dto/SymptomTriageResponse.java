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

    public static SymptomTriageResponseBuilder builder() {
        return new SymptomTriageResponseBuilder();
    }

    public static class SymptomTriageResponseBuilder {
        private String severity;
        private List<String> possibleCauses;
        private String recommendation;
        private String disclaimer;
        private LocalDateTime timestamp;

        public SymptomTriageResponseBuilder severity(String severity) { this.severity = severity; return this; }
        public SymptomTriageResponseBuilder possibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; return this; }
        public SymptomTriageResponseBuilder recommendation(String recommendation) { this.recommendation = recommendation; return this; }
        public SymptomTriageResponseBuilder disclaimer(String disclaimer) { this.disclaimer = disclaimer; return this; }
        public SymptomTriageResponseBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public SymptomTriageResponse build() {
            SymptomTriageResponse res = new SymptomTriageResponse();
            res.setSeverity(this.severity);
            res.setPossibleCauses(this.possibleCauses);
            res.setRecommendation(this.recommendation);
            res.setDisclaimer(this.disclaimer);
            res.setTimestamp(this.timestamp);
            return res;
        }
    }
}
