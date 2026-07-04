package com.example.backend.api.dto;

import com.example.backend.model.DiscountCode;

public class ValidateDiscountResponse {
    private boolean valid;
    private double discountAmount;
    private String message;
    private DiscountCode discount;

    public ValidateDiscountResponse() {}

    public ValidateDiscountResponse(boolean valid, double discountAmount, String message, DiscountCode discount) {
        this.valid = valid;
        this.discountAmount = discountAmount;
        this.message = message;
        this.discount = discount;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public DiscountCode getDiscount() {
        return discount;
    }

    public void setDiscount(DiscountCode discount) {
        this.discount = discount;
    }
}
