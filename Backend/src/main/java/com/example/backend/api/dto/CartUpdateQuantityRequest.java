package com.example.backend.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class CartUpdateQuantityRequest {
    @Min(-1000)
    @Max(1000)
    private int delta;

    public int getDelta() {
        return delta;
    }

    public void setDelta(int delta) {
        this.delta = delta;
    }
}
