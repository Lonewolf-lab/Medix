package com.medimind.record;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, UUID> {
    List<HealthRecord> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<HealthRecord> findByUserIdAndRecordType(UUID userId, RecordType recordType);
}
