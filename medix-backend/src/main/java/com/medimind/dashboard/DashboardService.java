package com.medimind.dashboard;

import com.medimind.chat.dto.ChatResponse;
import com.medimind.dashboard.dto.BiomarkerChatRequest;
import com.medimind.dashboard.dto.DashboardReportResponse;
import com.medimind.dashboard.dto.DashboardSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DashboardService {
    DashboardReportResponse uploadReport(UUID userId, MultipartFile file);
    DashboardSummaryResponse getHealthSummary(UUID userId);
    List<DashboardReportResponse> getAllReports(UUID userId);
    void deleteReport(UUID userId, UUID reportId);
    ChatResponse sendBiomarkerChatMessage(UUID userId, BiomarkerChatRequest request);
}
