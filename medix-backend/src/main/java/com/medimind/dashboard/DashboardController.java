package com.medimind.dashboard;

import com.medimind.chat.dto.ChatResponse;
import com.medimind.dashboard.dto.BiomarkerChatRequest;
import com.medimind.dashboard.dto.DashboardReportResponse;
import com.medimind.dashboard.dto.DashboardSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping(value = "/upload-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DashboardReportResponse> uploadReport(
            @RequestAttribute("userId") String userIdStr,
            @RequestPart("file") MultipartFile file) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(dashboardService.uploadReport(userId, file));
    }

    @GetMapping("/health-summary")
    public ResponseEntity<DashboardSummaryResponse> getHealthSummary(
            @RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(dashboardService.getHealthSummary(userId));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<DashboardReportResponse>> getAllReports(
            @RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(dashboardService.getAllReports(userId));
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        dashboardService.deleteReport(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/biomarker-chat")
    public ResponseEntity<ChatResponse> sendBiomarkerChatMessage(
            @RequestAttribute("userId") String userIdStr,
            @Valid @RequestBody BiomarkerChatRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(dashboardService.sendBiomarkerChatMessage(userId, request));
    }
}
