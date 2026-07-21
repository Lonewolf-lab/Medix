package com.medimind.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByUserIdOrderByAppointmentTimeDesc(UUID userId);
    List<Appointment> findByUserIdAndAppointmentTimeBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}
