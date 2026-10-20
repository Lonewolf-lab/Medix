package com.medimind.agent;

import com.medimind.agent.dto.ScheduleAgentRequest;
import com.medimind.agent.dto.ScheduleAgentResponse;
import com.medimind.ai.AIService;
import com.medimind.appointment.AppointmentService;
import com.medimind.appointment.dto.AppointmentRequest;
import com.medimind.appointment.dto.AppointmentResponse;
import com.medimind.medication.FrequencyType;
import com.medimind.medication.MedicationService;
import com.medimind.medication.dto.MedicationRequest;
import com.medimind.medication.dto.MedicationResponse;
import com.medimind.medication.dto.MedicationReminderRequest;
import com.medimind.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/scheduler/agent")
public class SchedulerAgentController {

    private final AIService aiService;
    private final AppointmentService appointmentService;
    private final MedicationService medicationService;

    public SchedulerAgentController(AIService aiService,
                                    AppointmentService appointmentService,
                                    MedicationService medicationService) {
        this.aiService = aiService;
        this.appointmentService = appointmentService;
        this.medicationService = medicationService;
    }

    @SuppressWarnings("unchecked")
    @PostMapping
    public ResponseEntity<ScheduleAgentResponse> executeAgentPrompt(
            @RequestBody ScheduleAgentRequest request,
            @RequestAttribute("userId") String userIdStr) {

        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ScheduleAgentResponse(
                    "UNKNOWN", "Please provide a valid prompt.", null, null
            ));
        }

        UUID userId = UUID.fromString(userIdStr);

        Map<String, Object> parsed = aiService.parseSchedulePrompt(request.getPrompt(), request.getTodayDate());
        String intentType = (String) parsed.getOrDefault("intentType", "UNKNOWN");

        ScheduleAgentResponse response = new ScheduleAgentResponse();
        response.setIntentType(intentType);

        if ("CREATE_APPOINTMENT".equalsIgnoreCase(intentType) || "APPOINTMENT".equalsIgnoreCase(intentType)) {
            String doctorName = (String) parsed.get("doctorName");
            if (doctorName == null || doctorName.isBlank()) {
                doctorName = "Doctor Visit";
            }
            String specialty = (String) parsed.get("specialty");
            String apptTimeStr = (String) parsed.get("appointmentTime");
            String targetDayOfWeek = (String) parsed.get("targetDayOfWeek");
            String notes = (String) parsed.get("notes");

            LocalDateTime apptTime = resolveAppointmentDateTime(apptTimeStr, targetDayOfWeek, request.getPrompt(), request.getTodayDate());

            AppointmentRequest apptReq = new AppointmentRequest();
            apptReq.setDoctorName(doctorName);
            apptReq.setSpecialty(specialty != null && !specialty.equalsIgnoreCase("null") ? specialty : "General Consultation");
            apptReq.setAppointmentTime(apptTime);
            apptReq.setNotes(notes != null && !notes.equalsIgnoreCase("null") ? notes : "Scheduled via AI Assistant");

            AppointmentResponse createdAppt = appointmentService.createAppointment(apptReq, userId);
            response.setCreatedAppointment(createdAppt);
            response.setMessage("Successfully scheduled appointment with " + createdAppt.getDoctorName() +
                    " for " + createdAppt.getAppointmentTime().format(HUMAN_FORMATTER));

        } else if ("CREATE_MEDICATION".equalsIgnoreCase(intentType) || "MEDICATION".equalsIgnoreCase(intentType)) {
            String medName = (String) parsed.get("medicationName");
            if (medName == null || medName.isBlank()) {
                medName = "Prescription Medication";
            }
            String dosage = (String) parsed.get("dosage");
            String freqStr = (String) parsed.get("frequency");
            String startDateStr = (String) parsed.get("startDate");
            String targetDayOfWeek = (String) parsed.get("targetDayOfWeek");
            String endDateStr = (String) parsed.get("endDate");
            String notes = (String) parsed.get("notes");

            FrequencyType frequency = FrequencyType.ONCE_DAILY;
            if (freqStr != null) {
                try {
                    frequency = FrequencyType.valueOf(freqStr.toUpperCase());
                } catch (Exception ignored) {}
            }

            LocalDate startDate = resolveStartDate(startDateStr, targetDayOfWeek, request.getPrompt(), request.getTodayDate());

            LocalDate endDate = null;
            if (endDateStr != null && !endDateStr.isBlank() && !endDateStr.equalsIgnoreCase("null")) {
                try {
                    endDate = LocalDate.parse(endDateStr.trim());
                } catch (Exception ignored) {}
            }
            if (endDate == null && request.getPrompt() != null) {
                Matcher dayMatcher = Pattern.compile("(?i)\\b(?:for\\s+)?(\\d{1,3})\\s*days?\\b").matcher(request.getPrompt());
                if (dayMatcher.find()) {
                    int days = Integer.parseInt(dayMatcher.group(1));
                    if (days > 0) {
                        endDate = startDate.plusDays(days);
                    }
                }
            }

            if (request.getPrompt() != null) {
                String pLower = request.getPrompt().toLowerCase();
                if ((pLower.contains("3 times") || pLower.contains("three times") || pLower.contains("thrice"))
                        && frequency == FrequencyType.ONCE_DAILY) {
                    frequency = FrequencyType.THREE_TIMES_DAILY;
                } else if ((pLower.contains("2 times") || pLower.contains("twice") || pLower.contains("two times"))
                        && frequency == FrequencyType.ONCE_DAILY) {
                    frequency = FrequencyType.TWICE_DAILY;
                }
            }

            MedicationRequest medReq = new MedicationRequest();
            medReq.setName(medName);
            medReq.setDosage(dosage != null && !dosage.equalsIgnoreCase("null") ? dosage : "As prescribed");
            medReq.setFrequency(frequency);
            medReq.setStartDate(startDate);
            medReq.setEndDate(endDate);
            medReq.setNotes(notes != null && !notes.equalsIgnoreCase("null") ? notes : "Added via AI Assistant");

            MedicationResponse createdMed = medicationService.createMedication(medReq, userId);

            List<String> reminderTimes = (List<String>) parsed.get("reminderTimes");
            if (reminderTimes == null || reminderTimes.isEmpty()) {
                if (frequency == FrequencyType.THREE_TIMES_DAILY) {
                    reminderTimes = List.of("08:00", "14:00", "20:00");
                } else if (frequency == FrequencyType.TWICE_DAILY) {
                    reminderTimes = List.of("09:00", "21:00");
                } else {
                    reminderTimes = List.of("09:00");
                }
            }

            for (String timeStr : reminderTimes) {
                try {
                    MedicationReminderRequest rReq = new MedicationReminderRequest();
                    rReq.setReminderTime(timeStr);
                    medicationService.addReminder(createdMed.getId(), rReq, userId);
                } catch (Exception ignored) {}
            }
            createdMed = medicationService.getMedicationById(createdMed.getId(), userId);

            response.setCreatedMedication(createdMed);
            response.setMessage("Successfully added medication reminder for " + createdMed.getName() +
                    " (" + createdMed.getDosage() + ") to your calendar & tracker.");

        } else if ("DELETE_MEDICATION".equalsIgnoreCase(intentType)) {
            String medName = (String) parsed.get("medicationName");
            if (medName == null || medName.isBlank()) {
                response.setIntentType("UNKNOWN");
                response.setMessage("Please specify which medication you want to stop or remove.");
                return ResponseEntity.ok(response);
            }

            List<MedicationResponse> activeMeds = medicationService.getActiveMedications(userId);
            MedicationResponse matchedMed = null;
            String searchName = medName.toLowerCase().replaceAll("[\\s-]", "");

            for (MedicationResponse m : activeMeds) {
                String mName = m.getName().toLowerCase().replaceAll("[\\s-]", "");
                if (mName.contains(searchName) || searchName.contains(mName)) {
                    matchedMed = m;
                    break;
                }
            }

            if (matchedMed != null) {
                medicationService.deleteMedication(matchedMed.getId(), userId);
                response.setMessage("Successfully stopped and removed medication log for: " + matchedMed.getName());
            } else {
                response.setIntentType("UNKNOWN");
                response.setMessage("Could not find an active medication named '" + medName + "' to stop.");
            }

        } else if ("DELETE_APPOINTMENT".equalsIgnoreCase(intentType)) {
            String doctorName = (String) parsed.get("doctorName");
            if (doctorName == null || doctorName.isBlank()) {
                response.setIntentType("UNKNOWN");
                response.setMessage("Please specify which doctor's appointment you want to cancel.");
                return ResponseEntity.ok(response);
            }

            List<AppointmentResponse> appts = appointmentService.getAllAppointments(userId);
            AppointmentResponse matchedAppt = null;
            String searchDoc = doctorName.toLowerCase().replace("dr.", "").trim().replaceAll("[\\s-]", "");

            for (AppointmentResponse a : appts) {
                String docName = a.getDoctorName().toLowerCase().replace("dr.", "").trim().replaceAll("[\\s-]", "");
                if (docName.contains(searchDoc) || searchDoc.contains(docName)) {
                    matchedAppt = a;
                    break;
                }
            }

            if (matchedAppt != null) {
                appointmentService.deleteAppointment(matchedAppt.getId(), userId);
                response.setMessage("Successfully cancelled doctor appointment with " + matchedAppt.getDoctorName());
            } else {
                response.setIntentType("UNKNOWN");
                response.setMessage("Could not find a scheduled appointment with doctor '" + doctorName + "'.");
            }

        } else if ("EDIT_MEDICATION_TIMINGS".equalsIgnoreCase(intentType)) {
            String medName = (String) parsed.get("medicationName");
            List<String> reminderTimes = (List<String>) parsed.get("reminderTimes");

            if (medName == null || medName.isBlank() || reminderTimes == null || reminderTimes.isEmpty()) {
                response.setIntentType("UNKNOWN");
                response.setMessage("Please specify the medication name and the new timings list.");
                return ResponseEntity.ok(response);
            }

            List<MedicationResponse> activeMeds = medicationService.getActiveMedications(userId);
            MedicationResponse matchedMed = null;
            String searchName = medName.toLowerCase().replaceAll("[\\s-]", "");

            for (MedicationResponse m : activeMeds) {
                String mName = m.getName().toLowerCase().replaceAll("[\\s-]", "");
                if (mName.contains(searchName) || searchName.contains(mName)) {
                    matchedMed = m;
                    break;
                }
            }

            if (matchedMed != null) {
                // Call updateReminderTimes to cleanly delete old reminders and save new ones in a single transaction
                MedicationResponse updatedMed = medicationService.updateReminderTimes(matchedMed.getId(), reminderTimes, userId);
                response.setCreatedMedication(updatedMed);
                response.setMessage("Successfully updated reminder timings of " + updatedMed.getName() + " to " + String.join(", ", reminderTimes) + ".");
            } else {
                response.setIntentType("UNKNOWN");
                response.setMessage("Could not find an active medication named '" + medName + "' to edit timings.");
            }

        } else {
            response.setIntentType("UNKNOWN");
            response.setMessage("I couldn't clarify a specific appointment or medication schedule from your prompt. Try saying: 'Meet Dr. Sharma on July 30 at 11:30 AM' or 'Add Glycomet fort at 10 AM for 3 weeks'.");
        }

        return ResponseEntity.ok(response);
    }

    private static final DateTimeFormatter HUMAN_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    private static final Pattern DAY_NAME_PATTERN = Pattern.compile(
            "(?i)\\b(?:on\\s+|this\\s+|next\\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b"
    );
    private static final Pattern NEXT_WEEK_PATTERN = Pattern.compile(
            "(?i)\\bnext\\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b"
    );
    private static final Pattern TIME_AMPM_PATTERN = Pattern.compile(
            "(?i)\\b(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\b"
    );
    private static final Pattern AT_TIME_PATTERN = Pattern.compile(
            "(?i)\\bat\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\b"
    );

    private LocalDate resolveToday(LocalDate todayDate) {
        return todayDate != null ? todayDate : LocalDate.now();
    }

    private LocalTime extractTime(String apptTimeStr, String prompt) {
        if (prompt != null) {
            Matcher m = TIME_AMPM_PATTERN.matcher(prompt);
            if (m.find()) {
                int hour = Integer.parseInt(m.group(1));
                int minute = m.group(2) != null ? Integer.parseInt(m.group(2)) : 0;
                String ampm = m.group(3).toUpperCase();
                if ("PM".equals(ampm) && hour < 12) {
                    hour += 12;
                } else if ("AM".equals(ampm) && hour == 12) {
                    hour = 0;
                }
                return LocalTime.of(hour, minute);
            }
            Matcher atM = AT_TIME_PATTERN.matcher(prompt);
            if (atM.find()) {
                int hour = Integer.parseInt(atM.group(1));
                int minute = atM.group(2) != null ? Integer.parseInt(atM.group(2)) : 0;
                String ampm = atM.group(3);
                if (ampm != null) {
                    if ("pm".equalsIgnoreCase(ampm) && hour < 12) {
                        hour += 12;
                    } else if ("am".equalsIgnoreCase(ampm) && hour == 12) {
                        hour = 0;
                    }
                } else {
                    if (hour >= 1 && hour <= 7) {
                        hour += 12;
                    }
                }
                return LocalTime.of(hour, minute);
            }
        }

        if (apptTimeStr != null && !apptTimeStr.isBlank() && !apptTimeStr.equalsIgnoreCase("null")) {
            try {
                String clean = apptTimeStr.trim().replace(" ", "T");
                if (clean.contains("T")) {
                    String timePart = clean.substring(clean.indexOf("T") + 1);
                    if (timePart.length() >= 5) {
                        return LocalTime.parse(timePart.substring(0, 5));
                    }
                }
            } catch (Exception ignored) {}
        }

        return LocalTime.of(10, 0);
    }

    private DayOfWeek extractDayOfWeek(String targetDayOfWeek, String prompt) {
        if (targetDayOfWeek != null && !targetDayOfWeek.isBlank() && !targetDayOfWeek.equalsIgnoreCase("null")) {
            try {
                return DayOfWeek.valueOf(targetDayOfWeek.trim().toUpperCase());
            } catch (Exception ignored) {}
        }
        if (prompt != null) {
            Matcher m = DAY_NAME_PATTERN.matcher(prompt);
            if (m.find()) {
                try {
                    return DayOfWeek.valueOf(m.group(1).toUpperCase());
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    LocalDateTime resolveAppointmentDateTime(String apptTimeStr, String targetDayOfWeek, String prompt, LocalDate todayDate) {
        LocalDate today = resolveToday(todayDate);
        LocalTime time = extractTime(apptTimeStr, prompt);
        LocalDate targetDate = null;

        DayOfWeek requestedDow = extractDayOfWeek(targetDayOfWeek, prompt);

        if (requestedDow != null) {
            boolean isExplicitNext = prompt != null && NEXT_WEEK_PATTERN.matcher(prompt).find();
            if (isExplicitNext) {
                targetDate = today.with(TemporalAdjusters.next(requestedDow));
                if (targetDate.equals(today)) {
                    targetDate = targetDate.plusWeeks(1);
                }
            } else {
                if (today.getDayOfWeek() == requestedDow) {
                    targetDate = today;
                } else {
                    targetDate = today.with(TemporalAdjusters.next(requestedDow));
                }
            }
        } else if (prompt != null && prompt.toLowerCase().contains("day after tomorrow")) {
            targetDate = today.plusDays(2);
        } else if (prompt != null && prompt.toLowerCase().contains("tomorrow")) {
            targetDate = today.plusDays(1);
        } else if (prompt != null && prompt.toLowerCase().contains("today")) {
            targetDate = today;
        }

        if (targetDate == null && apptTimeStr != null && !apptTimeStr.isBlank() && !apptTimeStr.equalsIgnoreCase("null")) {
            try {
                String clean = apptTimeStr.trim().replace(" ", "T");
                String datePart = clean.contains("T") ? clean.substring(0, clean.indexOf("T")) : clean;
                if (datePart.length() == 10) {
                    LocalDate parsedDate = LocalDate.parse(datePart);
                    if (!parsedDate.isBefore(today)) {
                        targetDate = parsedDate;
                    }
                }
            } catch (Exception ignored) {}
        }

        if (targetDate == null) {
            targetDate = today.plusDays(1);
        }

        if (requestedDow != null && targetDate.getDayOfWeek() != requestedDow) {
            targetDate = today.with(TemporalAdjusters.next(requestedDow));
        }

        return targetDate.atTime(time);
    }

    LocalDate resolveStartDate(String startDateStr, String targetDayOfWeek, String prompt, LocalDate todayDate) {
        LocalDate today = resolveToday(todayDate);
        DayOfWeek requestedDow = extractDayOfWeek(targetDayOfWeek, prompt);
        if (requestedDow != null) {
            if (today.getDayOfWeek() == requestedDow) {
                return today;
            }
            return today.with(TemporalAdjusters.next(requestedDow));
        }
        if (prompt != null && prompt.toLowerCase().contains("tomorrow")) {
            return today.plusDays(1);
        }
        if (startDateStr != null && !startDateStr.isBlank() && !startDateStr.equalsIgnoreCase("null")) {
            try {
                LocalDate parsed = LocalDate.parse(startDateStr.trim());
                if (!parsed.isBefore(today)) {
                    return parsed;
                }
            } catch (Exception ignored) {}
        }
        return today;
    }
}
