package com.medimind.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "Google credential token is required")
    private String credential;

    private Integer expiresIn;

    private String timeZone;

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String credential) {
        this.credential = credential;
    }

    public GoogleAuthRequest(String credential, Integer expiresIn, String timeZone) {
        this.credential = credential;
        this.expiresIn = expiresIn;
        this.timeZone = timeZone;
    }

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }
}
