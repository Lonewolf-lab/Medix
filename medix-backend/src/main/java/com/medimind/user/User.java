package com.medimind.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private LocalDate dob;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "lockout_until")
    private LocalDateTime lockoutUntil;

    @Column(name = "daily_upload_count")
    private Integer dailyUploadCount = 0;

    @Column(name = "daily_scan_count")
    private Integer dailyScanCount = 0;

    @Column(name = "daily_ai_chat_count")
    private Integer dailyAiChatCount = 0;

    @Column(name = "last_usage_reset_date")
    private LocalDate lastUsageResetDate;

    public User() {}

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getFailedLoginAttempts() { return failedLoginAttempts != null ? failedLoginAttempts : 0; }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts != null ? failedLoginAttempts : 0; }
    public LocalDateTime getLockoutUntil() { return lockoutUntil; }
    public void setLockoutUntil(LocalDateTime lockoutUntil) { this.lockoutUntil = lockoutUntil; }
    public int getDailyUploadCount() { return dailyUploadCount != null ? dailyUploadCount : 0; }
    public void setDailyUploadCount(Integer dailyUploadCount) { this.dailyUploadCount = dailyUploadCount != null ? dailyUploadCount : 0; }
    public int getDailyScanCount() { return dailyScanCount != null ? dailyScanCount : 0; }
    public void setDailyScanCount(Integer dailyScanCount) { this.dailyScanCount = dailyScanCount != null ? dailyScanCount : 0; }
    public int getDailyAiChatCount() { return dailyAiChatCount != null ? dailyAiChatCount : 0; }
    public void setDailyAiChatCount(Integer dailyAiChatCount) { this.dailyAiChatCount = dailyAiChatCount != null ? dailyAiChatCount : 0; }
    public LocalDate getLastUsageResetDate() { return lastUsageResetDate; }
    public void setLastUsageResetDate(LocalDate lastUsageResetDate) { this.lastUsageResetDate = lastUsageResetDate; }

    public void resetDailyCountersIfNewDay() {
        LocalDate today = LocalDate.now();
        if (this.lastUsageResetDate == null || !this.lastUsageResetDate.equals(today)) {
            this.dailyUploadCount = 0;
            this.dailyScanCount = 0;
            this.dailyAiChatCount = 0;
            this.lastUsageResetDate = today;
        }
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User obj = new User();
        public Builder name(String v)         { obj.name = v; return this; }
        public Builder email(String v)        { obj.email = v; return this; }
        public Builder passwordHash(String v) { obj.passwordHash = v; return this; }
        public Builder dob(LocalDate v)       { obj.dob = v; return this; }
        public Builder bloodGroup(String v)   { obj.bloodGroup = v; return this; }
        public User build()                   { return obj; }
    }
}