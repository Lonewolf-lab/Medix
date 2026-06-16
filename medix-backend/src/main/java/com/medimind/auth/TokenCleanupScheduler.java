package com.medimind.auth;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class TokenCleanupScheduler {

    private final BlacklistedTokenRepository repository;

    public TokenCleanupScheduler(BlacklistedTokenRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanExpiredTokens() {
        repository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
