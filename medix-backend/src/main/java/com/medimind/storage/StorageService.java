package com.medimind.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file);
    byte[] readFile(String fileUrl);
}
