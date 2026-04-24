package com.medimind.medication.dto;

import java.time.LocalDate;
import java.util.List;

public class MedicationContinuationRequest {
    private LocalDate newEndDate;
    private List<String> updatedReminderTimes;

    public MedicationContinuationRequest() {}

    public LocalDate getNewEndDate() { return newEndDate; }
    public void setNewEndDate(LocalDate newEndDate) { this.newEndDate = newEndDate; }
    public List<String> getUpdatedReminderTimes() { return updatedReminderTimes; }
    public void setUpdatedReminderTimes(List<String> v) { this.updatedReminderTimes = v; }
}
