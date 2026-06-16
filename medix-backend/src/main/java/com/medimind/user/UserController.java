package com.medimind.user;

import com.medimind.user.dto.UserProfileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@RequestAttribute("userId") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        UserProfileResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }
}
