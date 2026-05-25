package com.example.backend.service;

import com.example.backend.model.UserAccount;
import com.example.backend.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AdminUserService {
    private static final Set<String> ALLOWED_ROLES = Set.of("admin", "customer");

    private final UserAccountRepository userAccountRepository;

    public AdminUserService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public List<UserAccount> listUsers() {
        return userAccountRepository.findAllByOrderByCreatedAtDesc();
    }

    public UserAccount createUser(
            String email,
            String password,
            String displayName,
            String role,
            Boolean emailVerified
    ) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email khong hop le");
        }
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mat khau khong duoc de trong");
        }
        if (userAccountRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da duoc dang ky");
        }

        String normalizedRole = normalizeRole(role);

        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashPassword(password));
        user.setDisplayName(trimToNull(displayName));
        user.setEmailVerified(emailVerified != null && emailVerified);
        user.setRole(normalizedRole);
        user.setCreatedAt(Instant.now());

        return userAccountRepository.save(user);
    }

    public UserAccount updateUser(
            String userId,
            String email,
            String password,
            String displayName,
            String role,
            Boolean emailVerified
    ) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tai khoan"));

        if (email != null) {
            String normalizedEmail = normalizeEmail(email);
            if (normalizedEmail.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email khong hop le");
            }
            if (!normalizedEmail.equals(user.getEmail()) && userAccountRepository.existsByEmail(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da duoc dang ky");
            }
            user.setEmail(normalizedEmail);
        }

        if (password != null && !password.isBlank()) {
            user.setPasswordHash(hashPassword(password));
        }

        if (displayName != null) {
            user.setDisplayName(trimToNull(displayName));
        }

        if (role != null) {
            user.setRole(normalizeRole(role));
        }

        if (emailVerified != null) {
            user.setEmailVerified(emailVerified);
        }

        return userAccountRepository.save(user);
    }

    public void deleteUser(String userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tai khoan"));
        userAccountRepository.delete(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        String normalized = role == null ? "customer" : role.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_ROLES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai tro khong hop le");
        }
        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
}
