package com.medimind.record;

import com.medimind.record.dto.HealthRecordRequest;
import com.medimind.record.dto.HealthRecordResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface HealthRecordService {
    List<HealthRecordResponse> getAllRecords(UUID userId);
    HealthRecordResponse getRecordById(UUID userId, UUID recordId);
    HealthRecordResponse createRecord(UUID userId, HealthRecordRequest request, MultipartFile file);
    HealthRecordResponse updateRecord(UUID userId, UUID recordId, HealthRecordRequest request);
    void deleteRecord(UUID userId, UUID recordId);
    List<HealthRecordResponse> getRecordsByType(UUID userId, RecordType recordType);

    com.medimind.record.dto.DocumentAnalysisResponse analyzeRecord(UUID recordId, UUID userId);
    com.medimind.record.dto.DocumentAnalysisResponse getRecordAnalysis(UUID recordId, UUID userId);
    com.medimind.record.dto.DocumentChatResponse sendDocumentChatMessage(UUID recordId, UUID userId, com.medimind.record.dto.DocumentChatRequest request);
    List<com.medimind.record.dto.DocumentChatResponse> getDocumentChatHistory(UUID recordId, UUID userId);
    void clearDocumentChatHistory(UUID recordId, UUID userId);
}
