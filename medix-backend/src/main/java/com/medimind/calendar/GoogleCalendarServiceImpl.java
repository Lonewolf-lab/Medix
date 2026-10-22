package com.medimind.calendar;

import com.medimind.appointment.Appointment;
import com.medimind.appointment.AppointmentRepository;
import com.medimind.calendar.dto.CalendarConnectRequest;
import com.medimind.calendar.dto.CalendarStatusResponse;
import com.medimind.medication.FrequencyType;
import com.medimind.medication.Medication;
import com.medimind.medication.MedicationReminder;
import com.medimind.medication.MedicationReminderRepository;
import com.medimind.medication.MedicationRepository;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GoogleCalendarServiceImpl implements GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarServiceImpl.class);

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicationRepository medicationRepository;
    private final MedicationReminderRepository medicationReminderRepository;
    private final WebClient webClient;

    public GoogleCalendarServiceImpl(UserRepository userRepository,
                                    AppointmentRepository appointmentRepository,
                                    MedicationRepository medicationRepository,
                                    MedicationReminderRepository medicationReminderRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicationRepository = medicationRepository;
        this.medicationReminderRepository = medicationReminderRepository;
        this.webClient = WebClient.builder().build();
    }

    @Override
    public CalendarStatusResponse getStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isConnected = user.isGoogleConnected() && user.getGoogleAccessToken() != null;
        if (isConnected) {
            boolean expired = user.getGoogleTokenExpiresAt() != null && LocalDateTime.now().isAfter(user.getGoogleTokenExpiresAt());
            if (!expired && (user.getGoogleTokenExpiresAt() == null || !isTokenValid(user.getGoogleAccessToken()))) {
                expired = true;
            }

            if (expired) {
                user.setGoogleConnected(false);
                user.setGoogleAccessToken(null);
                user.setGoogleTokenExpiresAt(null);
                userRepository.save(user);
                isConnected = false;
            }
        }

        return new CalendarStatusResponse(
                isConnected,
                user.getTimeZone(),
                isConnected ? "Google Calendar is connected and syncing." : "Google Calendar is not connected.",
                0
        );
    }

    @Override
    public CalendarStatusResponse connectCalendar(UUID userId, CalendarConnectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request == null || request.getAccessToken() == null || request.getAccessToken().isBlank()) {
            throw new IllegalArgumentException("Google access token is required.");
        }

        user.setGoogleConnected(true);
        user.setGoogleAccessToken(request.getAccessToken().trim());
        int ttl = (request.getExpiresIn() != null && request.getExpiresIn() > 0) ? request.getExpiresIn() : 3540;
        user.setGoogleTokenExpiresAt(LocalDateTime.now().plusSeconds(ttl));
        if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) {
            user.setTimeZone(request.getTimeZone().trim());
        }
        userRepository.save(user);

        // Retroactively sync all existing active medications and upcoming appointments
        int synced = syncAllExistingSchedules(userId);

        return new CalendarStatusResponse(
                true,
                user.getTimeZone(),
                "Successfully connected Google Calendar! Synced " + synced + " item(s).",
                synced
        );
    }

    @Override
    public CalendarStatusResponse disconnectCalendar(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setGoogleConnected(false);
        user.setGoogleAccessToken(null);
        user.setGoogleTokenExpiresAt(null);
        userRepository.save(user);

        return new CalendarStatusResponse(
                false,
                user.getTimeZone(),
                "Google Calendar has been disconnected.",
                0
        );
    }

    @Override
    public int syncAllExistingSchedules(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || !user.isGoogleConnected() || user.getGoogleAccessToken() == null) {
            return 0;
        }

        if (!isTokenValid(user.getGoogleAccessToken())) {
            user.setGoogleConnected(false);
            user.setGoogleAccessToken(null);
            user.setGoogleTokenExpiresAt(null);
            userRepository.save(user);
            throw new IllegalStateException("Google Calendar session expired. Please reconnect.");
        }

        int count = 0;

        // 1. Sync future and recent appointments
        try {
            List<Appointment> appts = appointmentRepository.findByUserIdOrderByAppointmentTimeDesc(userId);
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            for (Appointment a : appts) {
                if (a.getAppointmentTime() != null && a.getAppointmentTime().isAfter(cutoff)) {
                    syncAppointment(a, user);
                    if (a.getGoogleEventId() != null) {
                        count++;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error batch syncing appointments to Google Calendar: {}", e.getMessage());
        }

        // 2. Sync all active medications
        try {
            List<Medication> activeMeds = medicationRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
            for (Medication m : activeMeds) {
                syncMedicationReminders(m, user);
                List<MedicationReminder> rems = medicationReminderRepository.findByMedicationId(m.getId());
                boolean anySynced = rems != null && rems.stream().anyMatch(r -> r.getGoogleEventId() != null && !r.getGoogleEventId().isBlank());
                if (anySynced) {
                    count++;
                }
            }
        } catch (Exception e) {
            log.error("Error batch syncing medications to Google Calendar: {}", e.getMessage());
        }

        return count;
    }

    @Override
    public void syncAppointment(Appointment appointment, User user) {
        if (appointment == null) {
            log.warn("Cannot sync appointment: appointment is null.");
            return;
        }
        if (user == null || !user.isGoogleConnected() || user.getGoogleAccessToken() == null) {
            log.warn("Cannot sync appointment '{}' ({}): user is null or not connected to Google Calendar (connected={}, hasToken={})",
                    appointment.getDoctorName(), appointment.getAppointmentTime(),
                    user != null && user.isGoogleConnected(),
                    user != null && user.getGoogleAccessToken() != null);
            return;
        }

        try {
            ZoneId zoneId = resolveZone(user);
            ZonedDateTime startZdt = appointment.getAppointmentTime().atZone(zoneId);
            ZonedDateTime endZdt = startZdt.plusMinutes(30);

            Map<String, Object> payload = new HashMap<>();
            String docName = appointment.getDoctorName() != null && !appointment.getDoctorName().isBlank()
                    ? appointment.getDoctorName()
                    : "Doctor Consultation";
            payload.put("summary", "🩺 " + docName + " (Medix)");
            payload.put("description", "Specialty: " + (appointment.getSpecialty() != null ? appointment.getSpecialty() : "General Consultation")
                    + "\nNotes: " + (appointment.getNotes() != null ? appointment.getNotes() : "Scheduled via Medix AI Assistant"));

            payload.put("start", Map.of(
                    "dateTime", startZdt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "timeZone", zoneId.getId()
            ));
            payload.put("end", Map.of(
                    "dateTime", endZdt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "timeZone", zoneId.getId()
            ));

            // Exact-time device notification (0 minutes before = at time of event)
            payload.put("reminders", Map.of(
                    "useDefault", false,
                    "overrides", List.of(Map.of("method", "popup", "minutes", 0))
            ));

            if (appointment.getGoogleEventId() != null && !appointment.getGoogleEventId().isBlank()) {
                updateGoogleEvent(user, appointment.getGoogleEventId(), payload);
            } else {
                Map<String, Object> res = createGoogleEvent(user, payload);
                if (res != null && res.get("id") != null) {
                    appointment.setGoogleEventId((String) res.get("id"));
                    appointmentRepository.save(appointment);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync appointment with Google Calendar: {}", e.getMessage());
        }
    }

    @Override
    public void deleteAppointmentEvent(Appointment appointment, User user) {
        if (appointment == null || user == null || !user.isGoogleConnected() || user.getGoogleAccessToken() == null) {
            return;
        }
        if (appointment.getGoogleEventId() != null && !appointment.getGoogleEventId().isBlank()) {
            try {
                deleteGoogleEvent(user, appointment.getGoogleEventId());
            } catch (Exception e) {
                log.warn("Failed to delete appointment from Google Calendar: {}", e.getMessage());
            }
        }
    }

    @Override
    public void syncMedicationReminders(Medication medication, User user) {
        if (medication == null || user == null || !user.isGoogleConnected() || user.getGoogleAccessToken() == null) {
            return;
        }

        try {
            ZoneId zoneId = resolveZone(user);
            LocalDate startDate = medication.getStartDate() != null ? medication.getStartDate() : LocalDate.now();

            // Prepare recurrence rule: UNTIL date if endDate is set
            List<String> recurrence = new ArrayList<>();
            if (medication.getEndDate() != null) {
                ZonedDateTime untilUtc = medication.getEndDate().atTime(23, 59, 59)
                        .atZone(zoneId)
                        .withZoneSameInstant(ZoneOffset.UTC);
                String untilStr = untilUtc.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
                recurrence.add("RRULE:FREQ=DAILY;UNTIL=" + untilStr);
            } else {
                recurrence.add("RRULE:FREQ=DAILY");
            }

            List<MedicationReminder> reminders = medicationReminderRepository.findByMedicationId(medication.getId());
            if (reminders == null || reminders.isEmpty()) {
                reminders = medication.getReminders();
            }
            if (reminders == null || reminders.isEmpty()) {
                // Generate default times from frequency
                List<String> defaultTimes = getDefaultTimes(medication.getFrequency());
                for (String t : defaultTimes) {
                    MedicationReminder r = MedicationReminder.builder()
                            .medication(medication)
                            .reminderTime(t)
                            .build();
                    medicationReminderRepository.save(r);
                }
                reminders = medicationReminderRepository.findByMedicationId(medication.getId());
            }

            for (MedicationReminder r : reminders) {
                if (!r.isActive() || r.getReminderTime() == null) continue;

                LocalTime time;
                try {
                    time = LocalTime.parse(r.getReminderTime());
                } catch (Exception ex) {
                    time = LocalTime.of(9, 0);
                }

                ZonedDateTime startZdt = startDate.atTime(time).atZone(zoneId);
                ZonedDateTime endZdt = startZdt.plusMinutes(15);

                Map<String, Object> payload = new HashMap<>();
                String dosageStr = medication.getDosage() != null ? medication.getDosage() : "As prescribed";
                payload.put("summary", "💊 Take " + medication.getName() + " (" + dosageStr + ")");
                payload.put("description", "Medix Medication Reminder\nDosage: " + dosageStr
                        + "\nScheduled at " + r.getReminderTime()
                        + "\nNotes: " + (medication.getNotes() != null ? medication.getNotes() : "Take as directed by doctor"));

                payload.put("start", Map.of(
                    "dateTime", startZdt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "timeZone", zoneId.getId()
                ));
                payload.put("end", Map.of(
                    "dateTime", endZdt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                    "timeZone", zoneId.getId()
                ));
                payload.put("recurrence", recurrence);

                // Exact-time reminder popup (0 minutes = exact time)
                payload.put("reminders", Map.of(
                    "useDefault", false,
                    "overrides", List.of(Map.of("method", "popup", "minutes", 0))
                ));

                if (r.getGoogleEventId() != null && !r.getGoogleEventId().isBlank()) {
                    updateGoogleEvent(user, r.getGoogleEventId(), payload);
                } else {
                    Map<String, Object> res = createGoogleEvent(user, payload);
                    if (res != null && res.get("id") != null) {
                        r.setGoogleEventId((String) res.get("id"));
                        medicationReminderRepository.save(r);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync medication to Google Calendar: {}", e.getMessage());
        }
    }

    @Override
    public void deleteMedicationEvents(Medication medication, User user) {
        if (medication == null || user == null || !user.isGoogleConnected() || user.getGoogleAccessToken() == null) {
            return;
        }

        try {
            List<MedicationReminder> reminders = medication.getReminders();
            if (reminders != null) {
                for (MedicationReminder r : reminders) {
                    if (r.getGoogleEventId() != null && !r.getGoogleEventId().isBlank()) {
                        deleteGoogleEvent(user, r.getGoogleEventId());
                        r.setGoogleEventId(null);
                        medicationReminderRepository.save(r);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to delete medication events from Google Calendar: {}", e.getMessage());
        }
    }

    private ZoneId resolveZone(User user) {
        if (user != null && user.getTimeZone() != null && !user.getTimeZone().isBlank()) {
            try {
                return ZoneId.of(user.getTimeZone().trim());
            } catch (Exception ignored) {}
        }
        return ZoneId.systemDefault();
    }

    private List<String> getDefaultTimes(FrequencyType frequency) {
        if (frequency == null) return List.of("09:00");
        return switch (frequency) {
            case TWICE_DAILY -> List.of("09:00", "21:00");
            case THREE_TIMES_DAILY -> List.of("08:00", "14:00", "20:00");
            case WEEKLY -> List.of("10:00");
            case AS_NEEDED -> List.of("09:00");
            default -> List.of("09:00");
        };
    }

    private boolean isTokenValid(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            webClient.get()
                    .uri("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            if (e.getStatusCode().value() == 401) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    private void handleUnauthorized(User user) {
        if (user != null) {
            user.setGoogleConnected(false);
            user.setGoogleAccessToken(null);
            user.setGoogleTokenExpiresAt(null);
            try {
                userRepository.save(user);
            } catch (Exception ignored) {}
        }
    }

    private Map<String, Object> createGoogleEvent(User user, Map<String, Object> payload) {
        if (user == null || user.getGoogleAccessToken() == null) return null;
        try {
            return webClient.post()
                    .uri("https://www.googleapis.com/calendar/v3/calendars/primary/events")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getGoogleAccessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Google Calendar create event API returned HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                handleUnauthorized(user);
            }
            return null;
        } catch (Exception e) {
            log.error("Google Calendar create event API call failed: {}", e.getMessage(), e);
            return null;
        }
    }

    private void updateGoogleEvent(User user, String eventId, Map<String, Object> payload) {
        if (user == null || user.getGoogleAccessToken() == null) return;
        try {
            webClient.put()
                    .uri("https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getGoogleAccessToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Google Calendar update event API returned HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                handleUnauthorized(user);
            }
        } catch (Exception e) {
            log.error("Google Calendar update event API call failed for event {}: {}", eventId, e.getMessage(), e);
        }
    }

    private void deleteGoogleEvent(User user, String eventId) {
        if (user == null || user.getGoogleAccessToken() == null) return;
        try {
            webClient.delete()
                    .uri("https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getGoogleAccessToken())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Google Calendar delete event API returned HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                handleUnauthorized(user);
            }
        } catch (Exception e) {
            log.error("Google Calendar delete event API call failed for event {}: {}", eventId, e.getMessage(), e);
        }
    }
}
