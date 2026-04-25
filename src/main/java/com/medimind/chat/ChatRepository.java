package com.medimind.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findByUserIdOrderByTimestampAsc(UUID userId);

    List<ChatMessage> findTop10ByUserIdOrderByTimestampDesc(UUID userId);

    void deleteByUserId(UUID userId);
}
