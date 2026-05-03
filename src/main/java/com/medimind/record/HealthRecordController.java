package com.medimind.record;

import com.medimind.record.dto.DocumentAnalysisResponse;
import com.medimind.record.dto.DocumentChatRequest;
import com.medimind.record.dto.DocumentChatResponse;
import com.medimind.record.dto.HealthRecordRequest;
import com.medimind.record.dto.HealthRecordResponse;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/records")
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    public HealthRecordController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @GetMapping
    public ResponseEntity<List<HealthRecordResponse>> getAllRecords(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(healthRecordService.getAllRecords(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthRecordResponse> getRecordById(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(healthRecordService.getRecordById(userId, id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HealthRecordResponse> createRecord(
            @RequestAttribute("userId") String userIdStr,
            @Valid @ModelAttribute HealthRecordRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        UUID userId = UUID.fromString(userIdStr);
        HealthRecordResponse response = healthRecordService.createRecord(userId, request, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HealthRecordResponse> updateRecord(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id,
            @Valid @RequestBody HealthRecordRequest request) {
        
        UUID userId = UUID.fromString(userIdStr);
        HealthRecordResponse response = healthRecordService.updateRecord(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        
        UUID userId = UUID.fromString(userIdStr);
        healthRecordService.deleteRecord(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{recordType}")
    public ResponseEntity<List<HealthRecordResponse>> getRecordsByType(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable RecordType recordType) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(healthRecordService.getRecordsByType(userId, recordType));
    }

    // --- AI Document Analysis Endpoints ---

    @PostMapping("/{id}/analyze")
    public ResponseEntity<DocumentAnalysisResponse> analyzeRecord(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        DocumentAnalysisResponse response = healthRecordService.analyzeRecord(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<DocumentAnalysisResponse> getRecordAnalysis(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        DocumentAnalysisResponse response = healthRecordService.getRecordAnalysis(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<DocumentChatResponse> sendDocumentChatMessage(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id,
            @Valid @RequestBody DocumentChatRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        DocumentChatResponse response = healthRecordService.sendDocumentChatMessage(id, userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/chat/history")
    public ResponseEntity<List<DocumentChatResponse>> getDocumentChatHistory(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(healthRecordService.getDocumentChatHistory(id, userId));
    }

    @DeleteMapping("/{id}/chat/history")
    public ResponseEntity<Void> clearDocumentChatHistory(
            @RequestAttribute("userId") String userIdStr,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdStr);
        healthRecordService.clearDocumentChatHistory(id, userId);
        return ResponseEntity.noContent().build();
    }
}
