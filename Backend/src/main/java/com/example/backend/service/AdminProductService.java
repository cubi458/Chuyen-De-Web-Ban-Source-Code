package com.example.backend.service;

import com.example.backend.model.ProductRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.repository.ProductRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminProductService {
    private static final Set<String> ALLOWED_CATEGORY_IDS = Set.of(
            "commerce",
            "portal",
            "management",
            "utility",
            "food",
            "ai"
    );

        private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp"
        );

    private final ProductRecordRepository productRecordRepository;

    @Value("${app.upload.products-dir:uploads/products}")
    private String productUploadDir;

    public AdminProductService(ProductRecordRepository productRecordRepository) {
        this.productRecordRepository = productRecordRepository;
    }

    public List<ProductRecord> listProducts() {
        return productRecordRepository.findAllByOrderByCreatedAtDesc();
    }

    public ProductRecord getProductById(String productId) {
        return productRecordRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay san pham"));
    }

    public Path getRequiredZipFilePath(ProductRecord product) {
        String zipPath = product.getZipFilePath();
        if (zipPath == null || zipPath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "San pham nay chua co file zip de tai");
        }

        Path filePath = Paths.get(zipPath).toAbsolutePath().normalize();
        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay file zip cua san pham");
        }

        return filePath;
    }

    @Transactional
    public void deleteProduct(String productId) {
        ProductRecord product = getProductById(productId);
        String zipPath = product.getZipFilePath();
        String coverPath = product.getCoverImagePath();
        String detailPaths = product.getDetailImagePaths();

        productRecordRepository.delete(product);

        if (zipPath == null || zipPath.isBlank()) {
            return;
        }

        try {
            Path filePath = Paths.get(zipPath).toAbsolutePath().normalize();
            // If file deletion fails, throw to trigger transaction rollback
            boolean deleted = Files.deleteIfExists(filePath);
            if (!deleted && Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the xoa file zip cua san pham");
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the xoa file zip cua san pham", ex);
        }

        deleteImageIfLocal(coverPath);
        if (detailPaths != null && !detailPaths.isBlank()) {
            for (String item : detailPaths.split(",")) {
                deleteImageIfLocal(item.trim());
            }
        }
    }

        @Transactional
        public ProductRecord createProduct(
            UserAccount admin,
            String title,
            double price,
            String categoryId,
            String techStack,
            String repository,
            String description,
            MultipartFile zipFile,
            MultipartFile coverImage,
            List<MultipartFile> detailImages
    ) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tieu de san pham khong duoc de trong");
        }
        if (price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gia san pham phai lon hon hoac bang 0");
        }
        if (categoryId == null || categoryId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh muc khong hop le");
        }
        String normalizedCategoryId = categoryId.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CATEGORY_IDS.contains(normalizedCategoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh muc khong nam trong he thong");
        }

        ProductRecord record = new ProductRecord();
        record.setId("prd-" + UUID.randomUUID());
        record.setTitle(title.trim());
        record.setSlug(generateUniqueSlug(title));
        record.setPrice(price);
        record.setCategoryId(normalizedCategoryId);
        record.setTechStack(trimToNull(techStack));
        record.setRepository(trimToNull(repository));
        record.setDescription(trimToNull(description));
        record.setCreatedBy(admin.getId());
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());

        // Persist record first (without zip info) to obtain DB state within transaction
        ProductRecord saved = productRecordRepository.save(record);
        if (coverImage != null && !coverImage.isEmpty()) {
            record.setCoverImagePath(saveImageFile(coverImage, "covers"));
        }

        if (detailImages != null && !detailImages.isEmpty()) {
            String detailPaths = detailImages.stream()
                    .filter(Objects::nonNull)
                    .filter(file -> !file.isEmpty())
                    .map(file -> saveImageFile(file, "details"))
                    .collect(Collectors.joining(","));
            record.setDetailImagePaths(trimToNull(detailPaths));
        }

        if (zipFile != null && !zipFile.isEmpty()) {
            String[] fileInfo = saveZipFile(zipFile);
            String savedName = fileInfo[0];
            String savedPath = fileInfo[1];

            // Register a synchronization to delete the file if transaction rolls back
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) {
                        try {
                            Files.deleteIfExists(Paths.get(savedPath));
                        } catch (IOException ignored) {
                        }
                    }
                }
            });

            saved.setZipFileName(savedName);
            saved.setZipFilePath(savedPath);
            saved = productRecordRepository.save(saved);
        }

        return saved;
    }

    public ProductRecord updateProduct(
            UserAccount admin,
            String productId,
            String title,
            Double price,
            String categoryId,
            String techStack,
            String repository,
            String description,
            MultipartFile zipFile,
            MultipartFile coverImage,
            List<MultipartFile> detailImages
    ) {
        ProductRecord record = getProductById(productId);

        if (title != null) {
            String trimmedTitle = title.trim();
            if (trimmedTitle.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tieu de san pham khong duoc de trong");
            }
            if (!trimmedTitle.equals(record.getTitle())) {
                record.setTitle(trimmedTitle);
                record.setSlug(generateUniqueSlug(trimmedTitle));
            }
        }

        if (price != null) {
            if (price < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gia san pham phai lon hon hoac bang 0");
            }
            record.setPrice(price);
        }

        if (categoryId != null) {
            String normalizedCategoryId = categoryId.trim().toLowerCase(Locale.ROOT);
            if (normalizedCategoryId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh muc khong hop le");
            }
            if (!ALLOWED_CATEGORY_IDS.contains(normalizedCategoryId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh muc khong nam trong he thong");
            }
            record.setCategoryId(normalizedCategoryId);
        }

        if (techStack != null) {
            record.setTechStack(trimToNull(techStack));
        }

        if (repository != null) {
            record.setRepository(trimToNull(repository));
        }

        if (description != null) {
            record.setDescription(trimToNull(description));
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            deleteImageIfLocal(record.getCoverImagePath());
            record.setCoverImagePath(saveImageFile(coverImage, "covers"));
        }

        if (detailImages != null && !detailImages.isEmpty()) {
            String previousDetailPaths = record.getDetailImagePaths();
            if (previousDetailPaths != null && !previousDetailPaths.isBlank()) {
                for (String item : previousDetailPaths.split(",")) {
                    deleteImageIfLocal(item.trim());
                }
            }
            String detailPaths = detailImages.stream()
                    .filter(Objects::nonNull)
                    .filter(file -> !file.isEmpty())
                    .map(file -> saveImageFile(file, "details"))
                    .collect(Collectors.joining(","));
            record.setDetailImagePaths(trimToNull(detailPaths));
        }

        if (zipFile != null && !zipFile.isEmpty()) {
            deleteZipIfLocal(record.getZipFilePath());
            String[] fileInfo = saveZipFile(zipFile);
            record.setZipFileName(fileInfo[0]);
            record.setZipFilePath(fileInfo[1]);
        }

        record.setUpdatedAt(Instant.now());
        record.setCreatedBy(admin.getId());

        return productRecordRepository.save(record);
    }

    private String[] saveZipFile(MultipartFile zipFile) {
        String originalName = zipFile.getOriginalFilename() == null ? "product.zip" : zipFile.getOriginalFilename();
        String lowercaseName = originalName.toLowerCase(Locale.ROOT);
        if (!lowercaseName.endsWith(".zip")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chi ho tro file .zip");
        }

        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storedName = UUID.randomUUID() + "-" + cleanName;

        try {
            Path storageDir = Paths.get(productUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(storageDir);
            Path destination = storageDir.resolve(storedName).normalize();
            if (!destination.startsWith(storageDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ten file khong hop le");
            }
            zipFile.transferTo(destination);
            return new String[]{originalName, destination.toString()};
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the luu file zip", ex);
        }
    }

    private String saveImageFile(MultipartFile imageFile, String subDir) {
        String originalName = imageFile.getOriginalFilename() == null ? "image" : imageFile.getOriginalFilename();
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String extension = "";
        int dotIndex = cleanName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = cleanName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chi ho tro file anh JPG/PNG/WebP");
        }

        String storedName = UUID.randomUUID() + "-" + cleanName;

        try {
            Path storageDir = Paths.get(productUploadDir, subDir).toAbsolutePath().normalize();
            Files.createDirectories(storageDir);
            Path destination = storageDir.resolve(storedName).normalize();
            if (!destination.startsWith(storageDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ten file khong hop le");
            }
            imageFile.transferTo(destination);
            return "/uploads/products/" + subDir + "/" + storedName;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the luu file anh", ex);
        }
    }

    private void deleteImageIfLocal(String pathValue) {
        if (pathValue == null || pathValue.isBlank()) {
            return;
        }
        if (pathValue.startsWith("asset:")) {
            return;
        }
        if (!pathValue.startsWith("/uploads/")) {
            return;
        }
        String relativePath = pathValue.replaceFirst("^/", "");
        try {
            Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Ignore delete errors for images.
        }
    }

    private void deleteZipIfLocal(String pathValue) {
        if (pathValue == null || pathValue.isBlank()) {
            return;
        }
        try {
            Path filePath = Paths.get(pathValue).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Ignore delete errors for zip files.
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateUniqueSlug(String title) {
        String base = title
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        if (base.isBlank()) {
            base = "source-product";
        }

        String candidate = base;
        int index = 1;
        while (productRecordRepository.existsBySlug(candidate)) {
            candidate = base + "-" + index;
            index++;
        }
        return candidate;
    }
}
