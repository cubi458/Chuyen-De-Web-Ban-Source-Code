package com.example.backend.api;

import com.example.backend.api.dto.AdminUserCreateRequest;
import com.example.backend.api.dto.AdminUserUpdateRequest;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AdminUserService;
import com.example.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AuthService authService;
    private final AdminUserService adminUserService;

    public AdminUserController(AuthService authService, AdminUserService adminUserService) {
        this.authService = authService;
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<Map<String, Object>> listUsers(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);
        return adminUserService.listUsers().stream().map(this::toUserDto).toList();
    }

    @PostMapping
    public Map<String, Object> createUser(
            @RequestHeader("Authorization") String authorization,
            @RequestBody AdminUserCreateRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        UserAccount created = adminUserService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getDisplayName(),
                request.getRole(),
                request.getEmailVerified()
        );

        return Map.of("success", true, "user", toUserDto(created));
    }

    @PatchMapping("/{userId}")
    public Map<String, Object> updateUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String userId,
            @RequestBody AdminUserUpdateRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        UserAccount updated = adminUserService.updateUser(
                userId,
                request.getEmail(),
                request.getPassword(),
                request.getDisplayName(),
                request.getRole(),
                request.getEmailVerified()
        );

        return Map.of("success", true, "user", toUserDto(updated));
    }

    @DeleteMapping("/{userId}")
    public Map<String, Object> deleteUser(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String userId
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        adminUserService.deleteUser(userId);
        return Map.of("success", true, "message", "Da xoa tai khoan");
    }

    private void requireAdmin(UserAccount user) {
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ban khong co quyen quan tri");
        }
    }

    private Map<String, Object> toUserDto(UserAccount user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "displayName", user.getDisplayName(),
                "emailVerified", user.isEmailVerified(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt() == null ? Instant.now().toString() : user.getCreatedAt().toString()
        );
    }
}
