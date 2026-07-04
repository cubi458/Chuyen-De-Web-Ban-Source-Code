package com.example.backend.api.dto;

import jakarta.validation.constraints.PositiveOrZero;

public class ValidateDiscountRequest {
    private String code;

    @PositiveOrZero
    private double subtotal;

    public ValidateDiscountRequest() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }
}
