package com.medimind.chat;

import com.medimind.chat.dto.ChatRequest;
import com.medimind.chat.dto.ChatResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @RequestAttribute("userId") String userIdStr) {
        ChatResponse response = chatService.sendMessage(UUID.fromString(userIdStr), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @RequestAttribute("userId") String userIdStr) {
        List<ChatResponse> history = chatService.getChatHistory(UUID.fromString(userIdStr));
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearChatHistory(
            @RequestAttribute("userId") String userIdStr) {
        chatService.clearChatHistory(UUID.fromString(userIdStr));
        return ResponseEntity.noContent().build();
    }
}
