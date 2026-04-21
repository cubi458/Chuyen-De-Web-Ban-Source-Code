package com.example.backend.api;

import com.example.backend.model.ProductRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AdminProductService;
import com.example.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    private final AuthService authService;
    private final AdminProductService adminProductService;

    public AdminProductController(AuthService authService, AdminProductService adminProductService) {
        this.authService = authService;
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public List<ProductRecord> listProducts(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);
        return adminProductService.listProducts();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> createProduct(
            @RequestHeader("Authorization") String authorization,
            @RequestParam String title,
            @RequestParam double price,
            @RequestParam String categoryId,
            @RequestParam(required = false) String techStack,
            @RequestParam(required = false) String repository,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile zipFile
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        ProductRecord product = adminProductService.createProduct(
                user,
                title,
                price,
                categoryId,
                techStack,
                repository,
                description,
                zipFile
        );

        return Map.of("success", true, "product", product);
    }

    @DeleteMapping("/{productId}")
    public Map<String, Object> deleteProduct(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String productId
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        adminProductService.deleteProduct(productId);
        return Map.of("success", true, "message", "Da xoa san pham");
    }

    private void requireAdmin(UserAccount user) {
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ban khong co quyen quan tri");
        }
    }
}
