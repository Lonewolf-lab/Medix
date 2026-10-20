package com.medimind.calendar.dto;

public class CalendarStatusResponse {

    private boolean connected;
    private String timeZone;
    private String message;
    private int syncedEventsCount;

    public CalendarStatusResponse() {}

    public CalendarStatusResponse(boolean connected, String timeZone, String message, int syncedEventsCount) {
        this.connected = connected;
        this.timeZone = timeZone;
        this.message = message;
        this.syncedEventsCount = syncedEventsCount;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getSyncedEventsCount() {
        return syncedEventsCount;
    }

    public void setSyncedEventsCount(int syncedEventsCount) {
        this.syncedEventsCount = syncedEventsCount;
    }
}
