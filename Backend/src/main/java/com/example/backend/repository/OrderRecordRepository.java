package com.example.backend.repository;

import com.example.backend.model.OrderRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRecordRepository extends JpaRepository<OrderRecord, String> {
    List<OrderRecord> findByUserIdOrderByCreatedAtDesc(String userId);
}
