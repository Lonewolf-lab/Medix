package com.medimind.appointment;

import com.medimind.appointment.dto.AppointmentRequest;
import com.medimind.appointment.dto.AppointmentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(UUID.fromString(userIdStr)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, UUID.fromString(userIdStr)));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @RequestAttribute("userId") String userIdStr) {
        AppointmentResponse response = appointmentService.createAppointment(request, UUID.fromString(userIdStr));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequest request,
            @RequestAttribute("userId") String userIdStr) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request, UUID.fromString(userIdStr)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userIdStr) {
        appointmentService.deleteAppointment(id, UUID.fromString(userIdStr));
        return ResponseEntity.noContent().build();
    }
}
