package com.medimind.medication.dto;

import java.util.List;

public class PrescriptionExtractionResponse {
    private List<ExtractedMedicationItem> extractedMedications;
    private String rawExtractedText;
    private int totalFound;
    private String disclaimer;

    public PrescriptionExtractionResponse() {}

    public List<ExtractedMedicationItem> getExtractedMedications() { return extractedMedications; }
    public void setExtractedMedications(List<ExtractedMedicationItem> v) { this.extractedMedications = v; }
    public String getRawExtractedText() { return rawExtractedText; }
    public void setRawExtractedText(String v) { this.rawExtractedText = v; }
    public int getTotalFound() { return totalFound; }
    public void setTotalFound(int v) { this.totalFound = v; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String v) { this.disclaimer = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final PrescriptionExtractionResponse obj = new PrescriptionExtractionResponse();
        public Builder extractedMedications(List<ExtractedMedicationItem> v) { obj.extractedMedications = v; return this; }
        public Builder rawExtractedText(String v) { obj.rawExtractedText = v; return this; }
        public Builder totalFound(int v)          { obj.totalFound = v; return this; }
        public Builder disclaimer(String v)       { obj.disclaimer = v; return this; }
        public PrescriptionExtractionResponse build() { return obj; }
    }
}
