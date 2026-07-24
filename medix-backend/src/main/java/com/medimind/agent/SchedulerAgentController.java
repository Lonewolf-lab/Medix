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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
            String notes = (String) parsed.get("notes");

            LocalDateTime apptTime = null;
            if (apptTimeStr != null && !apptTimeStr.isBlank() && !apptTimeStr.equalsIgnoreCase("null")) {
                try {
                    String cleanTimeStr = apptTimeStr.trim().replace(" ", "T");
                    if (cleanTimeStr.length() == 10) { // e.g. "2026-08-02"
                        apptTime = LocalDate.parse(cleanTimeStr).atTime(10, 0, 0);
                    } else if (cleanTimeStr.length() == 16) { // e.g. "2026-08-02T10:00"
                        apptTime = LocalDateTime.parse(cleanTimeStr + ":00");
                    } else {
                        apptTime = LocalDateTime.parse(cleanTimeStr);
                    }
                } catch (Exception e) {
                    System.out.println("Could not parse appointment time: " + apptTimeStr);
                }
            }
            if (apptTime == null) {
                apptTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0);
            }

            AppointmentRequest apptReq = new AppointmentRequest();
            apptReq.setDoctorName(doctorName);
            apptReq.setSpecialty(specialty != null && !specialty.equalsIgnoreCase("null") ? specialty : "General Consultation");
            apptReq.setAppointmentTime(apptTime);
            apptReq.setNotes(notes != null && !notes.equalsIgnoreCase("null") ? notes : "Scheduled via AI Assistant");

            AppointmentResponse createdAppt = appointmentService.createAppointment(apptReq, userId);
            response.setCreatedAppointment(createdAppt);
            response.setMessage("Successfully scheduled appointment with " + createdAppt.getDoctorName() +
                    " for " + createdAppt.getAppointmentTime().toString().replace("T", " at "));

        } else if ("CREATE_MEDICATION".equalsIgnoreCase(intentType) || "MEDICATION".equalsIgnoreCase(intentType)) {
            String medName = (String) parsed.get("medicationName");
            if (medName == null || medName.isBlank()) {
                medName = "Prescription Medication";
            }
            String dosage = (String) parsed.get("dosage");
            String freqStr = (String) parsed.get("frequency");
            String startDateStr = (String) parsed.get("startDate");
            String endDateStr = (String) parsed.get("endDate");
            String notes = (String) parsed.get("notes");

            FrequencyType frequency = FrequencyType.ONCE_DAILY;
            if (freqStr != null) {
                try {
                    frequency = FrequencyType.valueOf(freqStr.toUpperCase());
                } catch (Exception ignored) {}
            }

            LocalDate startDate = LocalDate.now();
            if (startDateStr != null && !startDateStr.isBlank() && !startDateStr.equalsIgnoreCase("null")) {
                try {
                    startDate = LocalDate.parse(startDateStr.trim());
                } catch (Exception ignored) {}
            }

            LocalDate endDate = null;
            if (endDateStr != null && !endDateStr.isBlank() && !endDateStr.equalsIgnoreCase("null")) {
                try {
                    endDate = LocalDate.parse(endDateStr.trim());
                } catch (Exception ignored) {}
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
            if (reminderTimes != null && !reminderTimes.isEmpty()) {
                for (String timeStr : reminderTimes) {
                    try {
                        MedicationReminderRequest rReq = new MedicationReminderRequest();
                        rReq.setReminderTime(timeStr);
                        medicationService.addReminder(createdMed.getId(), rReq, userId);
                    } catch (Exception ignored) {}
                }
                createdMed = medicationService.getMedicationById(createdMed.getId(), userId);
            }

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
}
