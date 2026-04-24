package com.medimind.medication;

import com.medimind.medication.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    // ─── CORE CRUD ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<MedicationResponse>> getAllMedications(
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.getAllMedications(UUID.fromString(userIdStr)));
    }

    @GetMapping("/active")
    public ResponseEntity<List<MedicationResponse>> getActiveMedications(
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.getActiveMedications(UUID.fromString(userIdStr)));
    }

    @GetMapping("/today")
    public ResponseEntity<List<MedicationResponse>> getTodayMedications(
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.getTodayMedications(UUID.fromString(userIdStr)));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<MedicationResponse>> getExpiredMedications(
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.getExpiredMedications(UUID.fromString(userIdStr)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationResponse> getMedicationById(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.getMedicationById(id, UUID.fromString(userIdStr)));
    }

    @PostMapping
    public ResponseEntity<MedicationResponse> createMedication(
            @Valid @RequestBody MedicationRequest request,
            @RequestAttribute("userId") String userIdStr) {
        MedicationResponse response = medicationService.createMedication(request, UUID.fromString(userIdStr));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationResponse> updateMedication(
            @PathVariable UUID id,
            @Valid @RequestBody MedicationRequest request,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.updateMedication(id, request, UUID.fromString(userIdStr)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        medicationService.deleteMedication(id, UUID.fromString(userIdStr));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<MedicationResponse> deactivateMedication(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.deactivateMedication(id, UUID.fromString(userIdStr)));
    }

    // ─── REMINDER MANAGEMENT ──────────────────────────────────────────────────

    @PostMapping("/{id}/reminders")
    public ResponseEntity<MedicationReminderResponse> addReminder(
            @PathVariable UUID id,
            @Valid @RequestBody MedicationReminderRequest request,
            @RequestAttribute("userId") String userIdStr) {
        MedicationReminderResponse response = medicationService.addReminder(id, request, UUID.fromString(userIdStr));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/reminders/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable UUID id,
            @PathVariable UUID reminderId,
            @RequestAttribute("userId") String userIdStr) {
        medicationService.deleteReminder(id, reminderId, UUID.fromString(userIdStr));
        return ResponseEntity.noContent().build();
    }

    // ─── PRESCRIPTION EXTRACTION ───────────────────────────────────────────────

    @PostMapping("/extract-prescription")
    public ResponseEntity<PrescriptionExtractionResponse> extractPrescription(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(medicationService.extractPrescription(file));
    }

    @PostMapping("/confirm-prescription")
    public ResponseEntity<List<MedicationResponse>> confirmPrescription(
            @Valid @RequestBody List<MedicationRequest> medications,
            @RequestAttribute("userId") String userIdStr) {
        List<MedicationResponse> saved = medicationService.confirmPrescription(medications, UUID.fromString(userIdStr));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ─── EXPIRY HANDLING ──────────────────────────────────────────────────────

    @PatchMapping("/{id}/continue")
    public ResponseEntity<MedicationResponse> continueMedication(
            @PathVariable UUID id,
            @RequestBody MedicationContinuationRequest request,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.continueMedication(id, request, UUID.fromString(userIdStr)));
    }

    @PatchMapping("/{id}/stop")
    public ResponseEntity<MedicationResponse> stopMedication(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(medicationService.stopMedication(id, UUID.fromString(userIdStr)));
    }
}
