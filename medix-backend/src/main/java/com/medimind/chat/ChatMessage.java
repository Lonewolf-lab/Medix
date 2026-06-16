package com.medimind.chat;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medimind.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String role; // "user" or "assistant"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "record_id", nullable = true)
    private UUID recordId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public ChatMessage() {}

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
        private final ChatMessage obj = new ChatMessage();
        public Builder user(User v)     { obj.user = v; return this; }
        public Builder role(String v)   { obj.role = v; return this; }
        public Builder content(String v){ obj.content = v; return this; }
        public Builder recordId(UUID v) { obj.recordId = v; return this; }
        public ChatMessage build()      { return obj; }
    }
}
