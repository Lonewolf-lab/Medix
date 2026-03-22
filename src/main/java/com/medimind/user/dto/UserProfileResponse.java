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

    public static UserProfileResponseBuilder builder() {
        return new UserProfileResponseBuilder();
    }

    public static class UserProfileResponseBuilder {
        private UUID id;
        private String name;
        private String email;
        private LocalDate dob;
        private String bloodGroup;

        public UserProfileResponseBuilder id(UUID id) { this.id = id; return this; }
        public UserProfileResponseBuilder name(String name) { this.name = name; return this; }
        public UserProfileResponseBuilder email(String email) { this.email = email; return this; }
        public UserProfileResponseBuilder dob(LocalDate dob) { this.dob = dob; return this; }
        public UserProfileResponseBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }

        public UserProfileResponse build() {
            UserProfileResponse response = new UserProfileResponse();
            response.setId(this.id);
            response.setName(this.name);
            response.setEmail(this.email);
            response.setDob(this.dob);
            response.setBloodGroup(this.bloodGroup);
            return response;
        }
    }
}
