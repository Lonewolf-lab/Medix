package com.medimind.chat;

import com.medimind.chat.dto.ChatRequest;
import com.medimind.chat.dto.ChatResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    
    ChatResponse sendMessage(UUID userId, ChatRequest request);
    
    List<ChatResponse> getChatHistory(UUID userId);
    
    void clearChatHistory(UUID userId);
}
