package com.example.backend.api;

import com.example.backend.model.ProductRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AuthService;
import com.example.backend.service.AdminProductService;
import com.example.backend.service.CommerceService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final AdminProductService adminProductService;
    private final AuthService authService;
    private final CommerceService commerceService;

    public ProductController(
            AdminProductService adminProductService,
            AuthService authService,
            CommerceService commerceService
    ) {
        this.adminProductService = adminProductService;
        this.authService = authService;
        this.commerceService = commerceService;
    }

    @GetMapping
    public List<PublicProductDto> listProducts() {
        return adminProductService.listProducts().stream().map(this::toPublicDto).toList();
    }

    @GetMapping("/{productId}")
    public PublicProductDto getProductDetail(@PathVariable String productId) {
        ProductRecord product = adminProductService.getProductById(productId);
        return toPublicDto(product);
    }

    @GetMapping("/{productId}/download")
    public ResponseEntity<Resource> downloadProduct(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String productId
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        boolean isAdmin = "admin".equalsIgnoreCase(user.getRole());
        if (!isAdmin && !commerceService.hasPaidAccess(user, productId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ban chua mua san pham nay");
        }

        ProductRecord product = adminProductService.getProductById(productId);
        Path zipPath = adminProductService.getRequiredZipFilePath(product);

        try {
            Resource resource = new UrlResource(zipPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay file zip cua san pham");
            }

            String fileName = product.getZipFileName() == null || product.getZipFileName().isBlank()
                ? product.getSlug() + ".zip"
                : product.getZipFileName();

            ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(fileName)
                .build();

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(java.nio.file.Files.size(zipPath))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .body(resource);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the tai file san pham", ex);
        }
    }

    private PublicProductDto toPublicDto(ProductRecord product) {
        return new PublicProductDto(
                product.getId(),
                product.getTitle(),
                product.getSlug(),
                product.getPrice(),
                product.getCategoryId(),
                product.getTechStack(),
                product.getRepository(),
                product.getDescription(),
            product.getCoverImagePath(),
            product.getDetailImagePaths(),
                product.getZipFileName(),
                product.getCreatedAt()
        );
    }

    public record PublicProductDto(
            String id,
            String title,
            String slug,
            double price,
            String categoryId,
            String techStack,
            String repository,
            String description,
            String coverImagePath,
            String detailImagePaths,
            String zipFileName,
            Instant createdAt
    ) {
    }
}
