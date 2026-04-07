package com.example.backend.service;

import com.example.backend.model.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final Map<String, UserAccount> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, UserAccount> usersById = new ConcurrentHashMap<>();
    private final Map<String, String> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> verifyCodes = new ConcurrentHashMap<>();
    private final MailService mailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.admin.email:admin@localhost}")
    private String adminEmail;

    public AuthService(MailService mailService) {
        this.mailService = mailService;
    }

    public UserAccount register(String email, String password, String displayName) {
        String normalizedEmail = normalizeEmail(email);
        if (usersByEmail.containsKey(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da duoc dang ky");
        }

        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashPassword(password));
        user.setDisplayName(displayName == null || displayName.isBlank() ? normalizedEmail : displayName);
        user.setEmailVerified(false);
        user.setRole(normalizedEmail.equalsIgnoreCase(adminEmail) ? "admin" : "customer");
        user.setCreatedAt(Instant.now());

        usersByEmail.put(normalizedEmail, user);
        usersById.put(user.getId(), user);

        sendVerification(user);
        return user;
    }

    public void verifyEmail(String code) {
        String userId = verifyCodes.remove(code);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ma xac thuc khong hop le hoac da het han");
        }
        UserAccount user = usersById.get(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nguoi dung khong ton tai");
        }
        user.setEmailVerified(true);
    }

    public void resendVerification(String email) {
        UserAccount user = usersByEmail.get(normalizeEmail(email));
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tai khoan");
        }
        if (user.isEmailVerified()) {
            return;
        }
        sendVerification(user);
    }

    public LoginResult login(String email, String password) {
        UserAccount user = usersByEmail.get(normalizeEmail(email));
        if (user == null || !user.getPasswordHash().equals(hashPassword(password))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai email hoac mat khau");
        }
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email chua duoc xac thuc. Vui long kiem tra hop thu va xac nhan tai khoan.");
        }

        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());
        return new LoginResult(token, user);
    }

    public void logout(String bearerToken) {
        String token = extractToken(bearerToken);
        sessions.remove(token);
    }

    public UserAccount getRequiredUser(String bearerToken) {
        String token = extractToken(bearerToken);
        String userId = sessions.get(token);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phien dang nhap khong hop le");
        }
        UserAccount user = usersById.get(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nguoi dung khong ton tai");
        }
        return user;
    }

    private void sendVerification(UserAccount user) {
        String code = UUID.randomUUID().toString();
        verifyCodes.put(code, user.getId());
        String verifyUrl = frontendBaseUrl + "/#/store/auth?mode=verifyEmail&code=" + code;
        mailService.sendVerificationEmail(user.getEmail(), verifyUrl);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String extractToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thieu token dang nhap");
        }
        return bearerToken.substring(7).trim();
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot hash password", ex);
        }
    }

    public record LoginResult(String token, UserAccount user) {
    }
}
