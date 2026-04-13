package com.example.backend.repository;

import com.example.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByUserIdOrderByIdDesc(String userId);

    Optional<CartItem> findByIdAndUserId(String id, String userId);

    Optional<CartItem> findByUserIdAndProductId(String userId, String productId);

    void deleteByIdAndUserId(String id, String userId);
}
