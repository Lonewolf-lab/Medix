package com.medimind.storage;

import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.record.HealthRecord;
import com.medimind.record.HealthRecordRepository;
import com.medimind.dashboard.DashboardReport;
import com.medimind.dashboard.DashboardReportRepository;
import com.medimind.dashboard.DashboardStorageService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
public class SecureFileController {

    private final StorageService storageService;
    private final DashboardStorageService dashboardStorageService;
    private final HealthRecordRepository healthRecordRepository;
    private final DashboardReportRepository dashboardReportRepository;

    public SecureFileController(StorageService storageService,
                                DashboardStorageService dashboardStorageService,
                                HealthRecordRepository healthRecordRepository,
                                DashboardReportRepository dashboardReportRepository) {
        this.storageService = storageService;
        this.dashboardStorageService = dashboardStorageService;
        this.healthRecordRepository = healthRecordRepository;
        this.dashboardReportRepository = dashboardReportRepository;
    }

    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Extract userId attribute (populated by JwtAuthenticationFilter)
        String userIdStr = (String) request.getAttribute("userId");
        if (userIdStr == null || userIdStr.isEmpty()) {
            throw new UnauthorizedException("Access Denied: Missing authorization");
        }
        UUID userId = UUID.fromString(userIdStr);

        byte[] fileBytes;
        String fileName;
        String contentType = "application/octet-stream";

        if (path.startsWith("/uploads/health-records/")) {
            // 1. Query HealthRecord to check ownership
            HealthRecord record = healthRecordRepository.findByFileUrl(path)
                    .orElseThrow(() -> new ResourceNotFoundException("File not found or not associated with any health record."));

            if (!record.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to access this file.");
            }

            fileBytes = storageService.readFile(path);
            fileName = record.getFileName();
            if (record.getFileType() != null) {
                contentType = record.getFileType();
            }
        } else if (path.startsWith("/uploads/dashboard-reports/")) {
            // 2. Query DashboardReport to check ownership
            DashboardReport report = dashboardReportRepository.findByFileUrl(path)
                    .orElseThrow(() -> new ResourceNotFoundException("File not found or not associated with any dashboard report."));

            if (!report.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to access this file.");
            }

            fileBytes = dashboardStorageService.readFile(path);
            fileName = report.getFileName();
            if (fileName != null) {
                if (fileName.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
                else if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
            }
        } else {
            throw new ResourceNotFoundException("Folder not supported");
        }

        ByteArrayResource resource = new ByteArrayResource(fileBytes);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
