package com.medimind.medication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    List<Medication> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Medication> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);

    List<Medication> findByUserIdAndIsActiveTrueAndStartDateLessThanEqualAndEndDateIsNull(
            UUID userId, LocalDate today);

    List<Medication> findByUserIdAndIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID userId, LocalDate start, LocalDate end);

    List<Medication> findByUserIdAndIsExpiredTrueAndIsActiveTrue(UUID userId);

    List<Medication> findByIsActiveTrueAndIsExpiredFalseAndEndDateIsNotNullAndEndDateBefore(LocalDate today);
}
