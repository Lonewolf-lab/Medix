package com.medimind.agent.dto;

import java.time.LocalDate;

public class ScheduleAgentRequest {
    private String prompt;
    private LocalDate todayDate;
    private String userTimeZone;

    public ScheduleAgentRequest() {}

    public ScheduleAgentRequest(String prompt, LocalDate todayDate, String userTimeZone) {
        this.prompt = prompt;
        this.todayDate = todayDate;
        this.userTimeZone = userTimeZone;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public LocalDate getTodayDate() {
        return todayDate;
    }

    public void setTodayDate(LocalDate todayDate) {
        this.todayDate = todayDate;
    }

    public String getUserTimeZone() {
        return userTimeZone;
    }

    public void setUserTimeZone(String userTimeZone) {
        this.userTimeZone = userTimeZone;
    }
}
