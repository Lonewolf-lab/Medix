package com.medimind.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DashboardReportResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private boolean isLatest;
    private LocalDateTime uploadedAt;
    private int totalBiomarkers;
    private int abnormalCount;

    public DashboardReportResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public boolean isLatest() { return isLatest; }
    public void setLatest(boolean isLatest) { this.isLatest = isLatest; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public int getTotalBiomarkers() { return totalBiomarkers; }
    public void setTotalBiomarkers(int totalBiomarkers) { this.totalBiomarkers = totalBiomarkers; }
    public int getAbnormalCount() { return abnormalCount; }
    public void setAbnormalCount(int abnormalCount) { this.abnormalCount = abnormalCount; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DashboardReportResponse obj = new DashboardReportResponse();
        public Builder id(UUID v)               { obj.id = v; return this; }
        public Builder fileName(String v)       { obj.fileName = v; return this; }
        public Builder fileUrl(String v)        { obj.fileUrl = v; return this; }
        public Builder isLatest(boolean v)      { obj.isLatest = v; return this; }
        public Builder uploadedAt(LocalDateTime v){ obj.uploadedAt = v; return this; }
        public Builder totalBiomarkers(int v)   { obj.totalBiomarkers = v; return this; }
        public Builder abnormalCount(int v)     { obj.abnormalCount = v; return this; }
        public DashboardReportResponse build()  { return obj; }
    }
}
