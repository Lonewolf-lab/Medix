package com.medimind.medication;

import com.medimind.medication.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MedicationService {

    // Core CRUD
    List<MedicationResponse> getAllMedications(UUID userId);
    List<MedicationResponse> getActiveMedications(UUID userId);
    List<MedicationResponse> getTodayMedications(UUID userId);
    List<MedicationResponse> getExpiredMedications(UUID userId);
    MedicationResponse getMedicationById(UUID medicationId, UUID userId);
    MedicationResponse createMedication(MedicationRequest request, UUID userId);
    MedicationResponse updateMedication(UUID medicationId, MedicationRequest request, UUID userId);
    void deleteMedication(UUID medicationId, UUID userId);
    MedicationResponse deactivateMedication(UUID medicationId, UUID userId);

    // Reminder management
    MedicationReminderResponse addReminder(UUID medicationId, MedicationReminderRequest request, UUID userId);
    void deleteReminder(UUID medicationId, UUID reminderId, UUID userId);

    // Prescription extraction
    PrescriptionExtractionResponse extractPrescription(MultipartFile file);
    List<MedicationResponse> confirmPrescription(List<MedicationRequest> medications, UUID userId);

    // Expiry handling
    MedicationResponse continueMedication(UUID medicationId, MedicationContinuationRequest request, UUID userId);
    MedicationResponse stopMedication(UUID medicationId, UUID userId);
}
