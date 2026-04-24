package com.medimind.user.dto;

import java.time.LocalDate;
import java.util.UUID;

public class UserProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private LocalDate dob;
    private String bloodGroup;

    public UserProfileResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final UserProfileResponse obj = new UserProfileResponse();
        public Builder id(UUID v)           { obj.id = v; return this; }
        public Builder name(String v)       { obj.name = v; return this; }
        public Builder email(String v)      { obj.email = v; return this; }
        public Builder dob(LocalDate v)     { obj.dob = v; return this; }
        public Builder bloodGroup(String v) { obj.bloodGroup = v; return this; }
        public UserProfileResponse build()  { return obj; }
    }
}
