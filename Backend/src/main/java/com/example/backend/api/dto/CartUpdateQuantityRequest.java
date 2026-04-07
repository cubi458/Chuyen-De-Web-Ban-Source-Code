package com.example.backend.api.dto;

public class CartUpdateQuantityRequest {
    private int delta;

    public int getDelta() {
        return delta;
    }

    public void setDelta(int delta) {
        this.delta = delta;
    }
}
