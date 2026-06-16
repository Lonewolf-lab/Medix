package com.medimind.auth;

import com.medimind.auth.dto.AuthResponse;
import com.medimind.auth.dto.LoginRequest;
import com.medimind.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    void blacklistToken(String token);
}
