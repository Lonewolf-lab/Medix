package com.medimind.medication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class MedicationReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(MedicationReminderScheduler.class);

    private final MedicationRepository medicationRepository;

    public MedicationReminderScheduler(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    /**
     * Runs every day at midnight.
     * Marks medications as expired if their endDate has passed.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void markExpiredMedications() {
        LocalDate today = LocalDate.now();
        log.info("Running expiry check for medications on {}", today);

        List<Medication> expiredMedications =
                medicationRepository.findByIsActiveTrueAndIsExpiredFalseAndEndDateIsNotNullAndEndDateBefore(today);

        for (Medication medication : expiredMedications) {
            medication.setExpired(true);
            medicationRepository.save(medication);
            log.info("Medication '{}' for user {} marked as expired",
                    medication.getName(), medication.getUser().getId());
        }

        log.info("Expiry check complete. {} medication(s) marked as expired.", expiredMedications.size());
    }
}
