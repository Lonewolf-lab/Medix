package com.medimind.symptom;

import com.medimind.symptom.dto.SymptomRequest;
import com.medimind.symptom.dto.SymptomTriageResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    public SymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<SymptomTriageResponse> analyzeSymptoms(
            @RequestAttribute("userId") String userIdStr,
            @Valid @RequestBody SymptomRequest request) {
        
        UUID userId = UUID.fromString(userIdStr);
        SymptomTriageResponse response = symptomService.analyzeSymptoms(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SymptomLog>> getSymptomHistory(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        List<SymptomLog> history = symptomService.getSymptomHistory(userId);
        return ResponseEntity.ok(history);
    }
}
