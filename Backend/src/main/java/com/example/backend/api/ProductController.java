package com.example.backend.api;

import com.example.backend.model.ProductRecord;
import com.example.backend.service.AdminProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final AdminProductService adminProductService;

    public ProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
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
            String zipFileName,
            Instant createdAt
    ) {
    }
}
