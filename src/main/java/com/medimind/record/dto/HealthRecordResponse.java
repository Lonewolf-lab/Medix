package com.medimind.record.dto;

import com.medimind.record.RecordType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class HealthRecordResponse {
    private UUID id;
    private String title;
    private String description;
    private RecordType recordType;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private String aiAnalysis;
    private LocalDate recordDate;
    private LocalDateTime createdAt;

    public HealthRecordResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public RecordType getRecordType() { return recordType; }
    public void setRecordType(RecordType recordType) { this.recordType = recordType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getAiAnalysis() { return aiAnalysis; }
    public void setAiAnalysis(String aiAnalysis) { this.aiAnalysis = aiAnalysis; }
    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final HealthRecordResponse obj = new HealthRecordResponse();
        public Builder id(UUID v)               { obj.id = v; return this; }
        public Builder title(String v)          { obj.title = v; return this; }
        public Builder description(String v)    { obj.description = v; return this; }
        public Builder recordType(RecordType v) { obj.recordType = v; return this; }
        public Builder fileUrl(String v)        { obj.fileUrl = v; return this; }
        public Builder fileName(String v)       { obj.fileName = v; return this; }
        public Builder fileType(String v)       { obj.fileType = v; return this; }
        public Builder aiAnalysis(String v)     { obj.aiAnalysis = v; return this; }
        public Builder recordDate(LocalDate v)  { obj.recordDate = v; return this; }
        public Builder createdAt(LocalDateTime v){ obj.createdAt = v; return this; }
        public HealthRecordResponse build()     { return obj; }
    }
}
