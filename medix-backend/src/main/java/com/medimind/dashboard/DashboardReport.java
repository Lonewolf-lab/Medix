package com.medimind.dashboard;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medimind.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dashboard_reports")
public class DashboardReport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String fileName;
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(columnDefinition = "TEXT")
    private String biomarkersJson;

    private LocalDateTime uploadedAt;

    private boolean isLatest = true;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
        this.isLatest = true;
    }

    public DashboardReport() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public String getBiomarkersJson() { return biomarkersJson; }
    public void setBiomarkersJson(String biomarkersJson) { this.biomarkersJson = biomarkersJson; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public boolean isLatest() { return isLatest; }
    public void setLatest(boolean isLatest) { this.isLatest = isLatest; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DashboardReport obj = new DashboardReport();
        public Builder id(UUID v)               { obj.id = v; return this; }
        public Builder user(User v)             { obj.user = v; return this; }
        public Builder fileName(String v)       { obj.fileName = v; return this; }
        public Builder fileUrl(String v)        { obj.fileUrl = v; return this; }
        public Builder extractedText(String v)  { obj.extractedText = v; return this; }
        public Builder biomarkersJson(String v) { obj.biomarkersJson = v; return this; }
        public Builder uploadedAt(LocalDateTime v){ obj.uploadedAt = v; return this; }
        public Builder isLatest(boolean v)      { obj.isLatest = v; return this; }
        public DashboardReport build()          { return obj; }
    }
}
