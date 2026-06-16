package com.medimind.symptom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.user.User;
import jakarta.persistence.*;

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

    @JsonIgnore
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

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<String> getSymptoms() { return symptoms; }
    public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
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

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SymptomLog obj = new SymptomLog();
        public Builder user(User v)                       { obj.user = v; return this; }
        public Builder symptoms(List<String> v)           { obj.symptoms = v; return this; }
        public Builder additionalNotes(String v)          { obj.additionalNotes = v; return this; }
        public Builder triageResult(String v)             { obj.triageResult = v; return this; }
        public Builder possibleCauses(List<String> v)     { obj.possibleCauses = v; return this; }
        public Builder recommendation(String v)           { obj.recommendation = v; return this; }
        public Builder severity(String v)                 { obj.severity = v; return this; }
        public SymptomLog build()                         { return obj; }
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