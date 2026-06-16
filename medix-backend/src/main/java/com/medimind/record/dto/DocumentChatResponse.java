package com.medimind.record.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentChatResponse {

    private UUID id;
    private String role;
    private String content;
    private UUID recordId;
    private LocalDateTime timestamp;

    public DocumentChatResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public UUID getRecordId() { return recordId; }
    public void setRecordId(UUID recordId) { this.recordId = recordId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DocumentChatResponse obj = new DocumentChatResponse();
        public Builder id(UUID v)               { obj.id = v; return this; }
        public Builder role(String v)           { obj.role = v; return this; }
        public Builder content(String v)        { obj.content = v; return this; }
        public Builder recordId(UUID v)         { obj.recordId = v; return this; }
        public Builder timestamp(LocalDateTime v){ obj.timestamp = v; return this; }
        public DocumentChatResponse build()     { return obj; }
    }
}
