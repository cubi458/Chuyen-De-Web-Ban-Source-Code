package com.example.backend.repository;

import com.example.backend.model.ProductRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRecordRepository extends JpaRepository<ProductRecord, String> {
    List<ProductRecord> findAllByOrderByCreatedAtDesc();

    boolean existsBySlug(String slug);
}
