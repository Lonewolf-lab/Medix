package com.medimind.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DashboardReportRepository extends JpaRepository<DashboardReport, UUID> {

    Optional<DashboardReport> findByUserIdAndIsLatestTrue(UUID userId);

    List<DashboardReport> findByUserIdOrderByUploadedAtDesc(UUID userId);

    List<DashboardReport> findByUserIdAndIsLatestFalse(UUID userId);

    @Modifying
    @Query("UPDATE DashboardReport d SET d.isLatest = false WHERE d.user.id = :userId")
    void updateIsLatestFalseForUser(@Param("userId") UUID userId);
}
