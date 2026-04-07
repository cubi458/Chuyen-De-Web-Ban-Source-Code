package com.example.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public class CartAddRequest {
    @NotBlank
    private String productId;

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }
}
