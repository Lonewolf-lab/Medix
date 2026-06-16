package com.medimind.dashboard;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardStorageService {

    private final Path fileStorageLocation;
    private final List<String> allowedFileTypes = Arrays.asList("application/pdf", "image/jpeg", "image/png", "image/jpg");
    private final long maxFileSize = 10 * 1024 * 1024; // 10MB

    public DashboardStorageService(@Value("${dashboard.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds the 10MB limit.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedFileTypes.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.");
        }

        String originalFileName = file.getOriginalFilename() != null ? StringUtils.cleanPath(file.getOriginalFilename()) : "unknown";
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }

        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            if (uniqueFileName.contains("..")) {
                throw new IllegalArgumentException("Sorry! Filename contains invalid path sequence " + uniqueFileName);
            }
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/dashboard-reports/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + uniqueFileName + ". Please try again!", ex);
        }
    }

    public byte[] readFile(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith("/uploads/dashboard-reports/")) {
                throw new IllegalArgumentException("Invalid file URL");
            }
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Cannot read file outside uploads directory.");
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file from storage", e);
        }
    }
}
