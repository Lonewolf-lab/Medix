package com.medimind.auth.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID userId;
    private String name;
    private String email;

    public AuthResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private UUID userId;
        private String name;
        private String email;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder userId(UUID userId) { this.userId = userId; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }

        public AuthResponse build() {
            AuthResponse res = new AuthResponse();
            res.setToken(this.token);
            res.setUserId(this.userId);
            res.setName(this.name);
            res.setEmail(this.email);
            return res;
        }
    }
}
