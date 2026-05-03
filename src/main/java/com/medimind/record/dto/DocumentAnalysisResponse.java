package com.medimind.record.dto;

import com.medimind.record.RecordType;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentAnalysisResponse {

    private UUID recordId;
    private String recordTitle;
    private RecordType recordType;
    private Object analysis;
    private LocalDateTime analyzedAt;

    public DocumentAnalysisResponse() {}

    public UUID getRecordId() { return recordId; }
    public void setRecordId(UUID recordId) { this.recordId = recordId; }
    public String getRecordTitle() { return recordTitle; }
    public void setRecordTitle(String recordTitle) { this.recordTitle = recordTitle; }
    public RecordType getRecordType() { return recordType; }
    public void setRecordType(RecordType recordType) { this.recordType = recordType; }
    public Object  getAnalysis() { return analysis; }
    public void setAnalysis(Object analysis) { this.analysis = analysis; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DocumentAnalysisResponse obj = new DocumentAnalysisResponse();
        public Builder recordId(UUID v)           { obj.recordId = v; return this; }
        public Builder recordTitle(String v)      { obj.recordTitle = v; return this; }
        public Builder recordType(RecordType v)   { obj.recordType = v; return this; }
        public Builder analysis(Object v)         { obj.analysis = v; return this; }
        public Builder analyzedAt(LocalDateTime v){ obj.analyzedAt = v; return this; }
        public DocumentAnalysisResponse build()   { return obj; }
    }
}
