package com.medimind.auth;

import com.medimind.auth.dto.AuthResponse;
import com.medimind.auth.dto.GoogleAuthRequest;
import com.medimind.auth.dto.LoginRequest;
import com.medimind.auth.dto.RegisterRequest;
import com.medimind.security.JwtTokenProvider;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

import com.medimind.calendar.GoogleCalendarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final GoogleCalendarService googleCalendarService;
    private final WebClient webClient;

    @Value("${google.client.id:}")
    private String configuredGoogleClientId;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           BlacklistedTokenRepository blacklistedTokenRepository,
                           GoogleCalendarService googleCalendarService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.googleCalendarService = googleCalendarService;
        this.webClient = WebClient.builder().build();
    }

    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        String cleanEmail = registerRequest.getEmail() != null ? registerRequest.getEmail().trim().toLowerCase() : "";
        String cleanName = registerRequest.getName() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(registerRequest.getName().trim()) : "";
        String cleanBloodGroup = registerRequest.getBloodGroup() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(registerRequest.getBloodGroup().trim()) : null;

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("Email is already in use.");
        }

        User user = User.builder()
                .name(cleanName)
                .email(cleanEmail)
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .dob(registerRequest.getDob())
                .bloodGroup(cleanBloodGroup)
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, registerRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication, savedUser.getId().toString());

        return AuthResponse.builder()
                .token(jwt)
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        String cleanEmail = loginRequest.getEmail() != null ? loginRequest.getEmail().trim().toLowerCase() : "";

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Incorrect email or password"));

        // 1. Check account lockout status
        if (user.getLockoutUntil() != null) {
            if (user.getLockoutUntil().isAfter(java.time.LocalDateTime.now())) {
                long minutesLeft = java.time.Duration.between(java.time.LocalDateTime.now(), user.getLockoutUntil()).toMinutes() + 1;
                throw new IllegalArgumentException("Account is temporarily locked due to multiple failed login attempts. Please try again in " + minutesLeft + " minute(s).");
            } else {
                // Lockout period expired; reset lockout status
                user.setLockoutUntil(null);
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }
        }

        // 2. Attempt authentication
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, loginRequest.getPassword())
            );
        } catch (Exception e) {
            // Increment failed attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setLockoutUntil(java.time.LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);

            if (attempts >= 5) {
                throw new IllegalArgumentException("Account has been locked for 15 minutes due to 5 consecutive failed login attempts.");
            }
            throw new IllegalArgumentException("Incorrect email or password");
        }

        // 3. Successful authentication -> Reset lockout counters
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication, user.getId().toString());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    @Override
    public void blacklistToken(String token) {
        if (token != null && !token.isEmpty()) {
            java.util.Date expiryDate = null;
            try {
                expiryDate = tokenProvider.getExpirationDateFromJWT(token);
            } catch (Exception e) {
                // if it fails to parse, we can still blacklist but default to +1 day
            }
            
            java.time.LocalDateTime expiresAt = (expiryDate != null) 
                ? expiryDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                : java.time.LocalDateTime.now().plusDays(1);

            BlacklistedToken blacklistedToken = new BlacklistedToken(token, expiresAt);
            blacklistedTokenRepository.save(blacklistedToken);
        }
    }

    @Override
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.getCredential() == null || request.getCredential().isBlank()) {
            throw new IllegalArgumentException("Google authentication token is missing.");
        }

        Map<String, Object> tokenInfo;
        String rawToken = request.getCredential().trim();
        try {
            if (rawToken.startsWith("ya29.") || !rawToken.contains(".")) {
                // Access Token: query Google userinfo endpoint
                tokenInfo = webClient.get()
                        .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                        .header("Authorization", "Bearer " + rawToken)
                        .retrieve()
                        .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();
            } else {
                // ID Token JWT: query Google tokeninfo endpoint
                tokenInfo = webClient.get()
                        .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + rawToken)
                        .retrieve()
                        .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                        .block();
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google token with Google servers: " + e.getMessage());
        }

        if (tokenInfo == null || tokenInfo.get("email") == null) {
            throw new IllegalArgumentException("Invalid Google token or email not present.");
        }

        if (configuredGoogleClientId != null && !configuredGoogleClientId.isBlank()) {
            String aud = (String) tokenInfo.get("aud");
            if (!configuredGoogleClientId.equals(aud)) {
                throw new IllegalArgumentException("Google token client mismatch (aud does not match configured client id).");
            }
        }

        String email = ((String) tokenInfo.get("email")).trim().toLowerCase();
        String name = (String) tokenInfo.get("name");
        if (name == null || name.isBlank()) {
            name = (String) tokenInfo.get("given_name");
        }
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        int ttl = (request.getExpiresIn() != null && request.getExpiresIn() > 0) ? request.getExpiresIn() : 3540;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .authProvider("GOOGLE")
                    .build();
            user.setGoogleConnected(true);
            user.setGoogleAccessToken(rawToken);
            user.setGoogleTokenExpiresAt(java.time.LocalDateTime.now().plusSeconds(ttl));
            if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) {
                user.setTimeZone(request.getTimeZone().trim());
            }
            user = userRepository.save(user);
        } else {
            if (user.getLockoutUntil() != null && user.getLockoutUntil().isBefore(java.time.LocalDateTime.now())) {
                user.setLockoutUntil(null);
            }
            user.setFailedLoginAttempts(0);
            user.setAuthProvider("GOOGLE");
            user.setGoogleConnected(true);
            user.setGoogleAccessToken(rawToken);
            user.setGoogleTokenExpiresAt(java.time.LocalDateTime.now().plusSeconds(ttl));
            if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) {
                user.setTimeZone(request.getTimeZone().trim());
            }
            user = userRepository.save(user);
        }

        // Retroactively sync all existing appointments and active medications to Google Calendar if already connected
        if (user.isGoogleConnected() && user.getGoogleAccessToken() != null) {
            try {
                log.info("Auto-syncing schedules to Google Calendar for user: {}", user.getEmail());
                int count = googleCalendarService.syncAllExistingSchedules(user.getId());
                log.info("Successfully synced {} schedule item(s) to Google Calendar for user: {}", count, user.getEmail());
            } catch (Exception e) {
                log.warn("Auto-sync on Google login deferred: {}", e.getMessage());
            }
        }

        org.springframework.security.core.userdetails.UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPasswordHash(),
                        java.util.Collections.emptyList()
                );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication, user.getId().toString());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
