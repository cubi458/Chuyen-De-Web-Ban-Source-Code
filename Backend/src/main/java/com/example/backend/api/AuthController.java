package com.example.backend.api;

import com.example.backend.api.dto.LoginRequest;
import com.example.backend.api.dto.RegisterRequest;
import com.example.backend.api.dto.ResendVerificationRequest;
import com.example.backend.api.dto.VerifyEmailRequest;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        UserAccount user = authService.register(request.getEmail(), request.getPassword(), request.getDisplayName());
        return Map.of(
                "success", true,
                "message", "Dang ky thanh cong. Vui long kiem tra email de xac thuc.",
                "user", toUserDto(user)
        );
    }

    @PostMapping("/verify-email")
    public Map<String, Object> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getCode());
        return Map.of("success", true, "message", "Xac thuc email thanh cong");
    }

    @PostMapping("/resend-verification")
    public Map<String, Object> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.getEmail());
        return Map.of("success", true, "message", "Da gui lai email xac thuc");
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        AuthService.LoginResult result = authService.login(request.getEmail(), request.getPassword());
        return Map.of(
                "token", result.token(),
                "user", toUserDto(result.user())
        );
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestHeader("Authorization") String authorization) {
        authService.logout(authorization);
        return Map.of("success", true);
    }

    @GetMapping("/me")
    public Map<String, Object> me(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        return Map.of("user", toUserDto(user));
    }

    private Map<String, Object> toUserDto(UserAccount user) {
        return Map.of(
                "uid", user.getId(),
                "email", user.getEmail(),
                "displayName", user.getDisplayName(),
                "emailVerified", user.isEmailVerified(),
                "role", user.getRole(),
                "metadata", Map.of("creationTime", user.getCreatedAt() == null ? Instant.now().toString() : user.getCreatedAt().toString())
        );
    }
}
