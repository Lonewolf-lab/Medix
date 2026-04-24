package com.medimind.medication.dto;

public class ExtractedMedicationItem {
    private String name;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
    private String confidence;

    public ExtractedMedicationItem() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ExtractedMedicationItem obj = new ExtractedMedicationItem();
        public Builder name(String v)       { obj.name = v; return this; }
        public Builder dosage(String v)     { obj.dosage = v; return this; }
        public Builder frequency(String v)  { obj.frequency = v; return this; }
        public Builder duration(String v)   { obj.duration = v; return this; }
        public Builder notes(String v)      { obj.notes = v; return this; }
        public Builder confidence(String v) { obj.confidence = v; return this; }
        public ExtractedMedicationItem build() { return obj; }
    }
}
