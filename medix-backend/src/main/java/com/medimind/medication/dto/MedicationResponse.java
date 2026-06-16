package com.medimind.medication.dto;

import com.medimind.medication.FrequencyType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class MedicationResponse {
    private UUID id;
    private String name;
    private String dosage;
    private FrequencyType frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private boolean isActive;
    private boolean isExpired;
    private boolean extractedFromPrescription;
    private List<MedicationReminderResponse> reminders;
    private LocalDateTime createdAt;

    public MedicationResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public FrequencyType getFrequency() { return frequency; }
    public void setFrequency(FrequencyType frequency) { this.frequency = frequency; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isExpired() { return isExpired; }
    public void setExpired(boolean expired) { isExpired = expired; }
    public boolean isExtractedFromPrescription() { return extractedFromPrescription; }
    public void setExtractedFromPrescription(boolean v) { this.extractedFromPrescription = v; }
    public List<MedicationReminderResponse> getReminders() { return reminders; }
    public void setReminders(List<MedicationReminderResponse> reminders) { this.reminders = reminders; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final MedicationResponse obj = new MedicationResponse();
        public Builder id(UUID v)                         { obj.id = v; return this; }
        public Builder name(String v)                     { obj.name = v; return this; }
        public Builder dosage(String v)                   { obj.dosage = v; return this; }
        public Builder frequency(FrequencyType v)         { obj.frequency = v; return this; }
        public Builder startDate(LocalDate v)             { obj.startDate = v; return this; }
        public Builder endDate(LocalDate v)               { obj.endDate = v; return this; }
        public Builder notes(String v)                    { obj.notes = v; return this; }
        public Builder isActive(boolean v)                { obj.isActive = v; return this; }
        public Builder isExpired(boolean v)               { obj.isExpired = v; return this; }
        public Builder extractedFromPrescription(boolean v){ obj.extractedFromPrescription = v; return this; }
        public Builder reminders(List<MedicationReminderResponse> v) { obj.reminders = v; return this; }
        public Builder createdAt(LocalDateTime v)         { obj.createdAt = v; return this; }
        public MedicationResponse build()                 { return obj; }
    }
}
