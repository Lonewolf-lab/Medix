package com.medimind.medication;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_reminders")
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "reminder_time", nullable = false)
    private String reminderTime;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public MedicationReminder() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        isActive = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Medication getMedication() { return medication; }
    public void setMedication(Medication medication) { this.medication = medication; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final MedicationReminder obj = new MedicationReminder();
        public Builder medication(Medication v)   { obj.medication = v; return this; }
        public Builder reminderTime(String v)     { obj.reminderTime = v; return this; }
        public MedicationReminder build()         { return obj; }
    }
}
