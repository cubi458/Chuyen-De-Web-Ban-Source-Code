package com.example.backend.model;

import java.time.LocalDate;

public class DiscountCode {
    private String code;
    private String type; // "percentage" or "fixed"
    private double value;
    private double minOrder;
    private LocalDate expiryDate;
    private boolean active;
    private String description;

    public DiscountCode() {}

    public DiscountCode(String code, String type, double value, double minOrder, LocalDate expiryDate, boolean active, String description) {
        this.code = code;
        this.type = type;
        this.value = value;
        this.minOrder = minOrder;
        this.expiryDate = expiryDate;
        this.active = active;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public double getMinOrder() {
        return minOrder;
    }

    public void setMinOrder(double minOrder) {
        this.minOrder = minOrder;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
