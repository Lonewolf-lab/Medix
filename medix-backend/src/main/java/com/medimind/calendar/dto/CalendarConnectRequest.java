package com.medimind.calendar.dto;

import jakarta.validation.constraints.NotBlank;

public class CalendarConnectRequest {

    @NotBlank(message = "Google access token is required")
    private String accessToken;

    private String timeZone;

    private Integer expiresIn;

    public CalendarConnectRequest() {}

    public CalendarConnectRequest(String accessToken, String timeZone) {
        this.accessToken = accessToken;
        this.timeZone = timeZone;
    }

    public CalendarConnectRequest(String accessToken, String timeZone, Integer expiresIn) {
        this.accessToken = accessToken;
        this.timeZone = timeZone;
        this.expiresIn = expiresIn;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }
}
