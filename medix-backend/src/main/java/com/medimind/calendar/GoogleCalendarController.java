package com.medimind.calendar;

import com.medimind.calendar.dto.CalendarConnectRequest;
import com.medimind.calendar.dto.CalendarStatusResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/calendar/google")
public class GoogleCalendarController {

    private final GoogleCalendarService googleCalendarService;

    public GoogleCalendarController(GoogleCalendarService googleCalendarService) {
        this.googleCalendarService = googleCalendarService;
    }

    @GetMapping("/status")
    public ResponseEntity<CalendarStatusResponse> getStatus(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(googleCalendarService.getStatus(userId));
    }

    @PostMapping("/connect")
    public ResponseEntity<CalendarStatusResponse> connect(
            @Valid @RequestBody CalendarConnectRequest request,
            @RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(googleCalendarService.connectCalendar(userId, request));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<CalendarStatusResponse> disconnect(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(googleCalendarService.disconnectCalendar(userId));
    }

    @PostMapping("/sync-all")
    public ResponseEntity<CalendarStatusResponse> syncAll(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        int synced = googleCalendarService.syncAllExistingSchedules(userId);
        return ResponseEntity.ok(new CalendarStatusResponse(
                true,
                null,
                "Successfully synced " + synced + " schedule item(s) to Google Calendar.",
                synced
        ));
    }
}
