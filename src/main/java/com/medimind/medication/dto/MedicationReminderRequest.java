package com.medimind.medication.dto;

import jakarta.validation.constraints.NotBlank;

public class MedicationReminderRequest {

    @NotBlank(message = "Reminder time is required (HH:mm format)")
    private String reminderTime;

    public MedicationReminderRequest() {}

    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
}
