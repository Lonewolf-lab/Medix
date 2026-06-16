package com.medimind.symptom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SymptomRepository extends JpaRepository<SymptomLog, UUID> {
    List<SymptomLog> findByUserIdOrderByTimestampDesc(UUID userId);
}
