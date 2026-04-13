package com.example.backend.repository;

import com.example.backend.model.ReviewRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRecordRepository extends JpaRepository<ReviewRecord, String> {
    List<ReviewRecord> findByProductIdOrderByCreatedAtDesc(String productId);
}
