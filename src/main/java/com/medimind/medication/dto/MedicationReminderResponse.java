package com.medimind.medication.dto;

import java.util.UUID;

public class MedicationReminderResponse {
    private UUID id;
    private String reminderTime;
    private boolean isActive;

    public MedicationReminderResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final MedicationReminderResponse obj = new MedicationReminderResponse();
        public Builder id(UUID v)              { obj.id = v; return this; }
        public Builder reminderTime(String v)  { obj.reminderTime = v; return this; }
        public Builder isActive(boolean v)     { obj.isActive = v; return this; }
        public MedicationReminderResponse build() { return obj; }
    }
}
