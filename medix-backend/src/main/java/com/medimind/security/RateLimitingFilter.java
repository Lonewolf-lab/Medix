package com.medimind.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final com.medimind.user.UserRepository userRepository;
    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    public RateLimitingFilter(com.medimind.user.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = request.getRemoteAddr();
        String userIdStr = (String) request.getAttribute("userId");
        String clientKey = (userIdStr != null && !userIdStr.isEmpty()) ? userIdStr : ip;

        Bucket bucket;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            // Rule 1: Auth routes - 5 requests per minute per IP
            String cacheKey = "auth_" + ip;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(5, Duration.ofMinutes(1)));
        } else if (path.contains("/chat") || 
                   path.contains("/analyze") || 
                   path.contains("/agent") || 
                   path.contains("/extract-prescription") || 
                   path.contains("/upload-report")) {
            // Rule 2: AI & Expensive routes (General/Doc/Biomarker Chats, Symptom/Doc Analyzers, Agent, Prescription Extractor, Report Uploader) - 10 requests per minute
            String cacheKey = "ai_" + clientKey;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(10, Duration.ofMinutes(1)));
        } else {
            String cacheKey = "gen_" + clientKey;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(100, Duration.ofMinutes(1)));
        }

        boolean isChatRequest = path.contains("/chat") || path.contains("/agent");

        if (bucket.tryConsume(1)) {
            // Check persistent daily limit for AI chats
            if (isChatRequest && userIdStr != null && !userIdStr.isEmpty()) {
                try {
                    java.util.UUID userId = java.util.UUID.fromString(userIdStr);
                    com.medimind.user.User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        user.resetDailyCountersIfNewDay();
                        if (user.getDailyAiChatCount() >= 20) {
                            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\": 429, \"error\": \"Quota Exceeded\", \"message\": \"Daily AI chat limit (20 messages) reached. Please try again tomorrow.\"}");
                            return;
                        }
                        user.setDailyAiChatCount(user.getDailyAiChatCount() + 1);
                        userRepository.save(user);
                    }
                } catch (Exception ex) {
                    System.err.println("Failed to enforce daily chat limits: " + ex.getMessage());
                }
            }
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Too many requests. Please slow down.\"}");
        }
    }

    private Bucket createNewBucket(int capacity, Duration duration) {
        Refill refill = Refill.intervally(capacity, duration);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
