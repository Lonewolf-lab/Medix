package com.medimind.auth;

import com.medimind.auth.dto.AuthResponse;
import com.medimind.auth.dto.LoginRequest;
import com.medimind.auth.dto.RegisterRequest;
import com.medimind.security.JwtTokenProvider;
import com.medimind.user.User;
import com.medimind.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           BlacklistedTokenRepository blacklistedTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
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
}
