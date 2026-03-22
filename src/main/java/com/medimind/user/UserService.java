package com.medimind.user;

import com.medimind.user.dto.UserProfileResponse;

import java.util.UUID;

public interface UserService {
    UserProfileResponse getUserProfile(UUID userId);
}
