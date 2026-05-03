package com.medimind.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class DashboardSummaryResponse {
    private UUID reportId;
    private String fileName;
    private LocalDateTime uploadedAt;
    private List<BiomarkerValue> biomarkers;
    private int totalBiomarkers;
    private int abnormalCount;
    private int normalCount;
    private String overallAssessment;
    private String disclaimer;

    public DashboardSummaryResponse() {}

    public UUID getReportId() { return reportId; }
    public void setReportId(UUID reportId) { this.reportId = reportId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public List<BiomarkerValue> getBiomarkers() { return biomarkers; }
    public void setBiomarkers(List<BiomarkerValue> biomarkers) { this.biomarkers = biomarkers; }
    public int getTotalBiomarkers() { return totalBiomarkers; }
    public void setTotalBiomarkers(int totalBiomarkers) { this.totalBiomarkers = totalBiomarkers; }
    public int getAbnormalCount() { return abnormalCount; }
    public void setAbnormalCount(int abnormalCount) { this.abnormalCount = abnormalCount; }
    public int getNormalCount() { return normalCount; }
    public void setNormalCount(int normalCount) { this.normalCount = normalCount; }
    public String getOverallAssessment() { return overallAssessment; }
    public void setOverallAssessment(String overallAssessment) { this.overallAssessment = overallAssessment; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final DashboardSummaryResponse obj = new DashboardSummaryResponse();
        public Builder reportId(UUID v)                 { obj.reportId = v; return this; }
        public Builder fileName(String v)               { obj.fileName = v; return this; }
        public Builder uploadedAt(LocalDateTime v)      { obj.uploadedAt = v; return this; }
        public Builder biomarkers(List<BiomarkerValue> v){ obj.biomarkers = v; return this; }
        public Builder totalBiomarkers(int v)           { obj.totalBiomarkers = v; return this; }
        public Builder abnormalCount(int v)             { obj.abnormalCount = v; return this; }
        public Builder normalCount(int v)               { obj.normalCount = v; return this; }
        public Builder overallAssessment(String v)      { obj.overallAssessment = v; return this; }
        public Builder disclaimer(String v)             { obj.disclaimer = v; return this; }
        public DashboardSummaryResponse build()         { return obj; }
    }
}
