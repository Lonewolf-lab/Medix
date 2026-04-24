package com.medimind.record;

import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.record.dto.HealthRecordRequest;
import com.medimind.record.dto.HealthRecordResponse;
import com.medimind.storage.StorageService;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HealthRecordServiceImpl implements HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public HealthRecordServiceImpl(HealthRecordRepository healthRecordRepository, 
                                   UserRepository userRepository, 
                                   StorageService storageService) {
        this.healthRecordRepository = healthRecordRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @Override
    public List<HealthRecordResponse> getAllRecords(UUID userId) {
        return healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HealthRecordResponse getRecordById(UUID userId, UUID recordId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        return mapToResponse(record);
    }

    @Override
    public HealthRecordResponse createRecord(UUID userId, HealthRecordRequest request, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        HealthRecord record = HealthRecord.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .recordType(request.getRecordType())
                .recordDate(request.getRecordDate())
                .build();

        if (file != null && !file.isEmpty()) {
            String fileUrl = storageService.store(file);
            record.setFileUrl(fileUrl);
            record.setFileName(file.getOriginalFilename());
            record.setFileType(file.getContentType());

            if ("application/pdf".equals(file.getContentType())) {
                try (InputStream is = file.getInputStream();
                     PDDocument document = org.apache.pdfbox.Loader.loadPDF(is.readAllBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String extractedText = stripper.getText(document);
                    record.setExtractedText(extractedText);
                } catch (Exception e) {
                    System.err.println("Failed to extract text from PDF: " + e.getMessage());
                }
            }
        }

        HealthRecord savedRecord = healthRecordRepository.save(record);
        return mapToResponse(savedRecord);
    }

    @Override
    public HealthRecordResponse updateRecord(UUID userId, UUID recordId, HealthRecordRequest request) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);

        record.setTitle(request.getTitle());
        record.setDescription(request.getDescription());
        record.setRecordType(request.getRecordType());
        record.setRecordDate(request.getRecordDate());

        HealthRecord updatedRecord = healthRecordRepository.save(record);
        return mapToResponse(updatedRecord);
    }

    @Override
    public void deleteRecord(UUID userId, UUID recordId) {
        HealthRecord record = getHealthRecordAndVerifyOwnership(userId, recordId);
        healthRecordRepository.delete(record);
    }

    @Override
    public List<HealthRecordResponse> getRecordsByType(UUID userId, RecordType recordType) {
        return healthRecordRepository.findByUserIdAndRecordType(userId, recordType)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private HealthRecord getHealthRecordAndVerifyOwnership(UUID userId, UUID recordId) {
        HealthRecord record = healthRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found"));
        
        if (!record.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this record");
        }
        
        return record;
    }

    private HealthRecordResponse mapToResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
                .id(record.getId())
                .title(record.getTitle())
                .description(record.getDescription())
                .recordType(record.getRecordType())
                .fileUrl(record.getFileUrl())
                .fileName(record.getFileName())
                .fileType(record.getFileType())
                .aiAnalysis(record.getAiAnalysis())
                .recordDate(record.getRecordDate())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
