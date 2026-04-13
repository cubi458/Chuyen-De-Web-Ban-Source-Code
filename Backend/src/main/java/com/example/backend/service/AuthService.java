package com.example.backend.service;

import com.example.backend.model.UserAccount;
import com.example.backend.model.VerificationToken;
import com.example.backend.repository.UserAccountRepository;
import com.example.backend.repository.VerificationTokenRepository;
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
    private final Map<String, String> sessions = new ConcurrentHashMap<>();
    private final MailService mailService;
    private final UserAccountRepository userAccountRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.admin.email:admin@localhost}")
    private String adminEmail;

    public AuthService(
            MailService mailService,
            UserAccountRepository userAccountRepository,
            VerificationTokenRepository verificationTokenRepository
    ) {
        this.mailService = mailService;
        this.userAccountRepository = userAccountRepository;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    public UserAccount register(String email, String password, String displayName) {
        String normalizedEmail = normalizeEmail(email);
        if (userAccountRepository.existsByEmail(normalizedEmail)) {
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

        userAccountRepository.save(user);

        sendVerification(user);
        return user;
    }

    public void verifyEmail(String code) {
        VerificationToken token = verificationTokenRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ma xac thuc khong hop le hoac da het han"));

        UserAccount user = userAccountRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nguoi dung khong ton tai"));

        user.setEmailVerified(true);
        userAccountRepository.save(user);
        verificationTokenRepository.delete(token);
    }

    public void resendVerification(String email) {
        UserAccount user = userAccountRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tai khoan"));

        if (user.isEmailVerified()) {
            return;
        }
        sendVerification(user);
    }

    public LoginResult login(String email, String password) {
        UserAccount user = userAccountRepository.findByEmail(normalizeEmail(email)).orElse(null);
        if (user == null || !user.getPasswordHash().equals(hashPassword(password))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai email hoac mat khau");
        }
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email chua duoc xac thuc. Vui long kiem tra hop thu va xac nhan tai khoan.");
        }

        String tokenValue = UUID.randomUUID().toString();
        sessions.put(tokenValue, user.getId());
        return new LoginResult(tokenValue, user);
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
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nguoi dung khong ton tai"));
    }

    private void sendVerification(UserAccount user) {
        String code = UUID.randomUUID().toString();

        verificationTokenRepository.deleteByUserId(user.getId());
        VerificationToken token = new VerificationToken();
        token.setCode(code);
        token.setUserId(user.getId());
        token.setCreatedAt(Instant.now());
        verificationTokenRepository.save(token);

        String verifyUrl = frontendBaseUrl + "/#/store/auth?mode=verifyEmail&oobCode=" + code;
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
