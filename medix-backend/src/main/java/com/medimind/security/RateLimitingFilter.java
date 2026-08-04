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

    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = request.getRemoteAddr();
        String userId = (String) request.getAttribute("userId");
        String clientKey = (userId != null && !userId.isEmpty()) ? userId : ip;

        Bucket bucket;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            String cacheKey = "auth_" + ip;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(5, Duration.ofMinutes(1)));
        } else if (path.startsWith("/api/chat/message") || 
                   path.startsWith("/api/scheduler/agent") || 
                   path.startsWith("/api/symptoms/analyze") || 
                   path.contains("/analyze")) {
            String cacheKey = "ai_" + clientKey;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(15, Duration.ofMinutes(1)));
        } else {
            String cacheKey = "gen_" + clientKey;
            bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(100, Duration.ofMinutes(1)));
        }

        if (bucket.tryConsume(1)) {
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
