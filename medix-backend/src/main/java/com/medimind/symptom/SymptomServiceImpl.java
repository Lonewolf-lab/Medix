package com.medimind.symptom;

import com.medimind.ai.AIService;
import com.medimind.ai.dto.AIResponse;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.symptom.dto.SymptomRequest;
import com.medimind.symptom.dto.SymptomTriageResponse;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class SymptomServiceImpl implements SymptomService {

    private final SymptomRepository symptomRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    public SymptomServiceImpl(SymptomRepository symptomRepository, UserRepository userRepository, AIService aiService) {
        this.symptomRepository = symptomRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    @Override
    public SymptomTriageResponse analyzeSymptoms(UUID userId, SymptomRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        int age = calculateAge(user.getDob());
        
        AIResponse aiResponse = aiService.analyzeSymptoms(
                request.getSymptoms(),
                request.getAdditionalNotes(),
                age,
                user.getBloodGroup()
        );

        SymptomLog log = SymptomLog.builder()
                .user(user)
                .symptoms(request.getSymptoms())
                .additionalNotes(request.getAdditionalNotes())
                .severity(aiResponse.getSeverity())
                .possibleCauses(aiResponse.getPossibleCauses())
                .recommendation(aiResponse.getRecommendation())
                .triageResult(aiResponse.getDisclaimer()) // Assuming disclaimer could be tied to triage or standalone message, the prompt asked to store triage_result which isn't mapped 1-1, I will store disclaimer locally or just as recommendation info
                .build();
                
        // Let's refine mapping according to requirements: 
        // TABLE requirement: triage_result (TEXT), possibly just storing the combined cause+severity or the disclaimer.
        log.setTriageResult(aiResponse.getDisclaimer());

        SymptomLog savedLog = symptomRepository.save(log);

        return SymptomTriageResponse.builder()
                .severity(aiResponse.getSeverity())
                .possibleCauses(aiResponse.getPossibleCauses())
                .recommendation(aiResponse.getRecommendation())
                .disclaimer(aiResponse.getDisclaimer())
                .timestamp(savedLog.getTimestamp())
                .build();
    }

    @Override
    public List<SymptomLog> getSymptomHistory(UUID userId) {
        return symptomRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    private int calculateAge(LocalDate dob) {
        if (dob == null) {
            return 30; // Default or unknown age fallback
        }
        return Period.between(dob, LocalDate.now()).getYears();
    }
}
