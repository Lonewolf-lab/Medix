package com.medimind.appointment;

import com.medimind.appointment.dto.AppointmentRequest;
import com.medimind.appointment.dto.AppointmentResponse;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    List<AppointmentResponse> getAllAppointments(UUID userId);
    AppointmentResponse getAppointmentById(UUID appointmentId, UUID userId);
    AppointmentResponse createAppointment(AppointmentRequest request, UUID userId);
    AppointmentResponse updateAppointment(UUID appointmentId, AppointmentRequest request, UUID userId);
    void deleteAppointment(UUID appointmentId, UUID userId);
}
