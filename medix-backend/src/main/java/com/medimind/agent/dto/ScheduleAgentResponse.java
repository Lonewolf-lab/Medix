package com.medimind.agent.dto;

import com.medimind.appointment.dto.AppointmentResponse;
import com.medimind.medication.dto.MedicationResponse;

public class ScheduleAgentResponse {
    private String intentType; // "APPOINTMENT", "MEDICATION", "CHAT_ONLY", "UNKNOWN"
    private String message;
    private AppointmentResponse createdAppointment;
    private MedicationResponse createdMedication;

    public ScheduleAgentResponse() {}

    public ScheduleAgentResponse(String intentType, String message, AppointmentResponse createdAppointment, MedicationResponse createdMedication) {
        this.intentType = intentType;
        this.message = message;
        this.createdAppointment = createdAppointment;
        this.createdMedication = createdMedication;
    }

    public String getIntentType() {
        return intentType;
    }

    public void setIntentType(String intentType) {
        this.intentType = intentType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AppointmentResponse getCreatedAppointment() {
        return createdAppointment;
    }

    public void setCreatedAppointment(AppointmentResponse createdAppointment) {
        this.createdAppointment = createdAppointment;
    }

    public MedicationResponse getCreatedMedication() {
        return createdMedication;
    }

    public void setCreatedMedication(MedicationResponse createdMedication) {
        this.createdMedication = createdMedication;
    }
}
