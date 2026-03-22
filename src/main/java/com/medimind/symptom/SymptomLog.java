package com.medimind.symptom;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.user.User;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "symptom_logs")
public class SymptomLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> symptoms;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "triage_result", columnDefinition = "TEXT")
    private String triageResult;

    @Convert(converter = StringListConverter.class)
    @Column(name = "possible_causes", columnDefinition = "TEXT")
    private List<String> possibleCauses;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private String severity;

    private LocalDateTime timestamp;

    public SymptomLog() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this. symptoms = symptoms; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public String getTriageResult() { return triageResult; }
    public void setTriageResult(String triageResult) { this.triageResult = triageResult; }

    public List<String> getPossibleCauses() { return possibleCauses; }
    public void setPossibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public static SymptomLogBuilder builder() {
        return new SymptomLogBuilder();
    }

    public static class SymptomLogBuilder {
        private User user;
        private List<String> symptoms;
        private String additionalNotes;
        private String severity;
        private List<String> possibleCauses;
        private String recommendation;
        private String triageResult;

        public SymptomLogBuilder user(User user) { this.user = user; return this;}
        public SymptomLogBuilder symptoms(List<String> symptoms) { this.symptoms = symptoms; return this;}
        public SymptomLogBuilder additionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; return this;}
        public SymptomLogBuilder severity(String severity) { this.severity = severity; return this;}
        public SymptomLogBuilder possibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; return this;}
        public SymptomLogBuilder recommendation(String recommendation) { this.recommendation = recommendation; return this;}
        public SymptomLogBuilder triageResult(String triageResult) { this.triageResult = triageResult; return this;}

        public SymptomLog build() {
            SymptomLog log = new SymptomLog();
            log.setUser(this.user);
            log.setSymptoms(this.symptoms);
            log.setAdditionalNotes(this.additionalNotes);
            log.setSeverity(this.severity);
            log.setPossibleCauses(this.possibleCauses);
            log.setRecommendation(this.recommendation);
            log.setTriageResult(this.triageResult);
            return log;
        }
    }
}

@Converter
class StringListConverter implements AttributeConverter<List<String>, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null) return null;
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
