package com.medimind.record.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentChatRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public DocumentChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
