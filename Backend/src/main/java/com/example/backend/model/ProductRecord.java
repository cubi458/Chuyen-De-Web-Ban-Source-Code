package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "product_records")
public class ProductRecord {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(nullable = false)
    private double price;

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId;

    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Column(length = 500)
    private String repository;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "zip_file_name", length = 255)
    private String zipFileName;

    @Column(name = "zip_file_path", length = 500)
    private String zipFilePath;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getZipFileName() {
        return zipFileName;
    }

    public void setZipFileName(String zipFileName) {
        this.zipFileName = zipFileName;
    }

    public String getZipFilePath() {
        return zipFilePath;
    }

    public void setZipFilePath(String zipFilePath) {
        this.zipFilePath = zipFilePath;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
