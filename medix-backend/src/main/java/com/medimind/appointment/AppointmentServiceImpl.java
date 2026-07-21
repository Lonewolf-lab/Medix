package com.medimind.appointment;

import com.medimind.appointment.dto.AppointmentRequest;
import com.medimind.appointment.dto.AppointmentResponse;
import com.medimind.exception.ResourceNotFoundException;
import com.medimind.exception.UnauthorizedException;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(UUID userId) {
        return appointmentRepository.findByUserIdOrderByAppointmentTimeDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID appointmentId, UUID userId) {
        Appointment appointment = getAppointmentAndVerifyOwnership(appointmentId, userId);
        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Appointment appointment = Appointment.builder()
                .user(user)
                .doctorName(request.getDoctorName())
                .specialty(request.getSpecialty())
                .appointmentTime(request.getAppointmentTime())
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Override
    public AppointmentResponse updateAppointment(UUID appointmentId, AppointmentRequest request, UUID userId) {
        Appointment appointment = getAppointmentAndVerifyOwnership(appointmentId, userId);

        appointment.setDoctorName(request.getDoctorName());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());

        Appointment updated = appointmentRepository.save(appointment);
        return mapToResponse(updated);
    }

    @Override
    public void deleteAppointment(UUID appointmentId, UUID userId) {
        Appointment appointment = getAppointmentAndVerifyOwnership(appointmentId, userId);
        appointmentRepository.delete(appointment);
    }

    private Appointment getAppointmentAndVerifyOwnership(UUID appointmentId, UUID userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this appointment");
        }

        return appointment;
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(appointment.getId());
        res.setDoctorName(appointment.getDoctorName());
        res.setSpecialty(appointment.getSpecialty());
        res.setAppointmentTime(appointment.getAppointmentTime());
        res.setNotes(appointment.getNotes());
        res.setCreatedAt(appointment.getCreatedAt());
        return res;
    }
}
