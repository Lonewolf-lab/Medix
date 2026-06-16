package com.medimind.medication;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.medication.dto.*;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String groqApiUrl;
    private final String groqApiKey;

    public MedicationServiceImpl(
            MedicationRepository medicationRepository,
            MedicationReminderRepository reminderRepository,
            UserRepository userRepository,
            WebClient anthropicWebClient,
            ObjectMapper objectMapper,
            @Value("${ai.api.url}") String groqApiUrl,
            @Value("${ai.api.key}") String groqApiKey) {
        this.medicationRepository = medicationRepository;
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.webClient = anthropicWebClient;
        this.objectMapper = objectMapper;
        this.groqApiUrl = groqApiUrl;
        this.groqApiKey = groqApiKey;
    }

    // ─── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    public List<MedicationResponse> getAllMedications(UUID userId) {
        return medicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<MedicationResponse> getActiveMedications(UUID userId) {
        return medicationRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<MedicationResponse> getTodayMedications(UUID userId) {
        LocalDate today = LocalDate.now();
        List<Medication> openEnded = medicationRepository
                .findByUserIdAndIsActiveTrueAndStartDateLessThanEqualAndEndDateIsNull(userId, today);
        List<Medication> bounded = medicationRepository
                .findByUserIdAndIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(userId, today, today);
        List<Medication> combined = new ArrayList<>(openEnded);
        combined.addAll(bounded);
        return combined.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<MedicationResponse> getExpiredMedications(UUID userId) {
        return medicationRepository.findByUserIdAndIsExpiredTrueAndIsActiveTrue(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public MedicationResponse getMedicationById(UUID medicationId, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        return toResponse(medication);
    }

    @Override
    @Transactional
    public MedicationResponse createMedication(MedicationRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Medication medication = Medication.builder()
                .user(user)
                .name(request.getName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .build();

        Medication saved = medicationRepository.save(medication);
        addReminderTimes(saved, request.getReminderTimes());
        return toResponse(medicationRepository.save(saved));
    }

    @Override
    @Transactional
    public MedicationResponse updateMedication(UUID medicationId, MedicationRequest request, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        medication.setName(request.getName());
        medication.setDosage(request.getDosage());
        medication.setFrequency(request.getFrequency());
        medication.setStartDate(request.getStartDate());
        medication.setEndDate(request.getEndDate());
        medication.setNotes(request.getNotes());
        return toResponse(medicationRepository.save(medication));
    }

    @Override
    @Transactional
    public void deleteMedication(UUID medicationId, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        medicationRepository.delete(medication);
    }

    @Override
    @Transactional
    public MedicationResponse deactivateMedication(UUID medicationId, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        medication.setActive(false);
        medication.setExpired(false);
        return toResponse(medicationRepository.save(medication));
    }

    // ─── REMINDERS ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MedicationReminderResponse addReminder(UUID medicationId, MedicationReminderRequest request, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        MedicationReminder reminder = MedicationReminder.builder()
                .medication(medication)
                .reminderTime(request.getReminderTime())
                .build();
        MedicationReminder saved = reminderRepository.save(reminder);
        return toReminderResponse(saved);
    }

    @Override
    @Transactional
    public void deleteReminder(UUID medicationId, UUID reminderId, UUID userId) {
        findAndVerifyOwnership(medicationId, userId); // ownership check
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));
        reminderRepository.delete(reminder);
    }

    // ─── PRESCRIPTION EXTRACTION ───────────────────────────────────────────────

    @Override
    @SuppressWarnings("unchecked")
    public PrescriptionExtractionResponse extractPrescription(MultipartFile file) {
        try {
            String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
            String rawText = "";
            List<Map<String, Object>> messages;

            if (contentType.contains("pdf")) {
                // PDF: extract text with PDFBox
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    rawText = new PDFTextStripper().getText(doc);
                }
                final String textContent = rawText;
                messages = List.of(
                        Map.of("role", "system", "content",
                                "You are a medical prescription analyzer. Extract all medications from the " +
                                "provided prescription text. Respond ONLY with valid JSON, no extra text, " +
                                "no markdown, no code blocks: " +
                                "{\"extractedMedications\":[{\"name\":\"medication name or UNCLEAR\"," +
                                "\"dosage\":\"dosage or UNCLEAR\",\"frequency\":\"how often or UNCLEAR\"," +
                                "\"duration\":\"how long or UNCLEAR\",\"notes\":\"any special instructions\"," +
                                "\"confidence\":\"HIGH or MEDIUM or LOW\"}],\"totalFound\":0," +
                                "\"disclaimer\":\"Please verify all extracted information before saving\"}"),
                        Map.of("role", "user", "content",
                                "Extract all medications from this prescription:\n" + textContent)
                );
            } else if (contentType.contains("image") || contentType.contains("jpeg") || contentType.contains("png")) {
                // Image: convert to base64
                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                String mimeType = contentType.contains("png") ? "image/png" : "image/jpeg";
                messages = List.of(
                        Map.of("role", "system", "content",
                                "You are a medical prescription analyzer. Extract all medications from the " +
                                "prescription image. Respond ONLY with valid JSON, no extra text, no markdown, " +
                                "no code blocks: " +
                                "{\"extractedMedications\":[{\"name\":\"medication name or UNCLEAR\"," +
                                "\"dosage\":\"dosage or UNCLEAR\",\"frequency\":\"how often or UNCLEAR\"," +
                                "\"duration\":\"how long or UNCLEAR\",\"notes\":\"any special instructions\"," +
                                "\"confidence\":\"HIGH or MEDIUM or LOW\"}],\"totalFound\":0," +
                                "\"disclaimer\":\"Please verify all extracted information before saving\"}"),
                        Map.of("role", "user", "content", List.of(
                                Map.of("type", "image_url", "image_url",
                                        Map.of("url", "data:" + mimeType + ";base64," + base64)),
                                Map.of("type", "text", "text", "Extract all medications from this prescription image.")
                        ))
                );
            } else {
                throw new IllegalArgumentException("Unsupported file type. Please upload a PDF or image (JPG, PNG).");
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", contentType.contains("pdf") ? "llama-3.3-70b-versatile" : "meta-llama/llama-4-scout-17b-16e-instruct");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.1);

            String responseStr = webClient.post()
                    .uri(groqApiUrl)
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String jsonText = ((String) message.get("content")).trim();

            // Strip markdown code blocks if present
            if (jsonText.startsWith("```")) {
                jsonText = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            Map<String, Object> extracted = objectMapper.readValue(jsonText, Map.class);
            List<Map<String, Object>> rawMeds = (List<Map<String, Object>>) extracted.get("extractedMedications");

            List<ExtractedMedicationItem> items = rawMeds.stream().map(m ->
                    ExtractedMedicationItem.builder()
                            .name((String) m.getOrDefault("name", "UNCLEAR"))
                            .dosage((String) m.getOrDefault("dosage", "UNCLEAR"))
                            .frequency((String) m.getOrDefault("frequency", "UNCLEAR"))
                            .duration((String) m.getOrDefault("duration", "UNCLEAR"))
                            .notes((String) m.getOrDefault("notes", ""))
                            .confidence((String) m.getOrDefault("confidence", "LOW"))
                            .build()
            ).collect(Collectors.toList());

            return PrescriptionExtractionResponse.builder()
                    .extractedMedications(items)
                    .rawExtractedText(rawText)
                    .totalFound(items.size())
                    .disclaimer("Please verify all extracted information before saving")
                    .build();

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to extract prescription: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public List<MedicationResponse> confirmPrescription(List<MedicationRequest> medications, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return medications.stream().map(request -> {
            Medication medication = Medication.builder()
                    .user(user)
                    .name(request.getName())
                    .dosage(request.getDosage())
                    .frequency(request.getFrequency())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .notes(request.getNotes())
                    .extractedFromPrescription(true)
                    .build();
            Medication saved = medicationRepository.save(medication);
            addReminderTimes(saved, request.getReminderTimes());
            return toResponse(medicationRepository.save(saved));
        }).collect(Collectors.toList());
    }

    // ─── EXPIRY HANDLING ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public MedicationResponse continueMedication(UUID medicationId, MedicationContinuationRequest request, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        medication.setExpired(false);
        medication.setEndDate(request.getNewEndDate());

        if (request.getUpdatedReminderTimes() != null && !request.getUpdatedReminderTimes().isEmpty()) {
            medication.getReminders().clear();
            medicationRepository.save(medication); // flush removals via orphanRemoval
            addReminderTimes(medication, request.getUpdatedReminderTimes());
        }

        return toResponse(medicationRepository.save(medication));
    }

    @Override
    @Transactional
    public MedicationResponse stopMedication(UUID medicationId, UUID userId) {
        Medication medication = findAndVerifyOwnership(medicationId, userId);
        medication.setActive(false);
        medication.setExpired(false);
        return toResponse(medicationRepository.save(medication));
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Medication findAndVerifyOwnership(UUID medicationId, UUID userId) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));
        if (!medication.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this medication");
        }
        return medication;
    }

    private void addReminderTimes(Medication medication, List<String> reminderTimes) {
        if (reminderTimes == null || reminderTimes.isEmpty()) return;
        for (String time : reminderTimes) {
            MedicationReminder reminder = MedicationReminder.builder()
                    .medication(medication)
                    .reminderTime(time)
                    .build();
            reminderRepository.save(reminder);
        }
    }

    private MedicationResponse toResponse(Medication m) {
        List<MedicationReminderResponse> reminderResponses = m.getReminders().stream()
                .map(this::toReminderResponse)
                .collect(Collectors.toList());

        return MedicationResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .dosage(m.getDosage())
                .frequency(m.getFrequency())
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .notes(m.getNotes())
                .isActive(m.isActive())
                .isExpired(m.isExpired())
                .extractedFromPrescription(m.isExtractedFromPrescription())
                .reminders(reminderResponses)
                .createdAt(m.getCreatedAt())
                .build();
    }

    private MedicationReminderResponse toReminderResponse(MedicationReminder r) {
        return MedicationReminderResponse.builder()
                .id(r.getId())
                .reminderTime(r.getReminderTime())
                .isActive(r.isActive())
                .build();
    }
}
