package com.medimind.calendar;

import com.medimind.appointment.Appointment;
import com.medimind.calendar.dto.CalendarConnectRequest;
import com.medimind.calendar.dto.CalendarStatusResponse;
import com.medimind.medication.Medication;
import com.medimind.user.User;

import java.util.UUID;

public interface GoogleCalendarService {

    CalendarStatusResponse getStatus(UUID userId);

    CalendarStatusResponse connectCalendar(UUID userId, CalendarConnectRequest request);

    CalendarStatusResponse disconnectCalendar(UUID userId);

    int syncAllExistingSchedules(UUID userId);

    void syncAppointment(Appointment appointment, User user);

    void deleteAppointmentEvent(Appointment appointment, User user);

    void syncMedicationReminders(Medication medication, User user);

    void deleteMedicationEvents(Medication medication, User user);
}
