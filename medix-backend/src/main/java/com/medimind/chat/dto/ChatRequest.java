package com.medimind.chat.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ChatRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private List<String> pinnedBiomarkers;

    public ChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getPinnedBiomarkers() { return pinnedBiomarkers; }
    public void setPinnedBiomarkers(List<String> pinnedBiomarkers) { this.pinnedBiomarkers = pinnedBiomarkers; }
}
