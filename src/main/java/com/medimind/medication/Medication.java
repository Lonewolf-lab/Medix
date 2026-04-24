package com.medimind.medication;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medimind.user.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medications")
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequencyType frequency;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "is_expired", nullable = false)
    private boolean isExpired;

    @Column(name = "extracted_from_prescription", nullable = false)
    private boolean extractedFromPrescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<MedicationReminder> reminders = new ArrayList<>();

    public Medication() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        isActive = true;
        isExpired = false;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public FrequencyType getFrequency() { return frequency; }
    public void setFrequency(FrequencyType frequency) { this.frequency = frequency; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isExpired() { return isExpired; }
    public void setExpired(boolean expired) { isExpired = expired; }
    public boolean isExtractedFromPrescription() { return extractedFromPrescription; }
    public void setExtractedFromPrescription(boolean v) { this.extractedFromPrescription = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<MedicationReminder> getReminders() { return reminders; }
    public void setReminders(List<MedicationReminder> reminders) { this.reminders = reminders; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Medication obj = new Medication();

        public Builder user(User v)                         { obj.user = v; return this; }
        public Builder name(String v)                       { obj.name = v; return this; }
        public Builder dosage(String v)                     { obj.dosage = v; return this; }
        public Builder frequency(FrequencyType v)           { obj.frequency = v; return this; }
        public Builder startDate(LocalDate v)               { obj.startDate = v; return this; }
        public Builder endDate(LocalDate v)                 { obj.endDate = v; return this; }
        public Builder notes(String v)                      { obj.notes = v; return this; }
        public Builder extractedFromPrescription(boolean v) { obj.extractedFromPrescription = v; return this; }

        public Medication build() { return obj; }
    }
}
