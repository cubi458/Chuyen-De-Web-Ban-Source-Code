package com.example.backend.api;

import com.example.backend.api.dto.CartAddRequest;
import com.example.backend.api.dto.CartUpdateQuantityRequest;
import com.example.backend.api.dto.CreateOrderRequest;
import com.example.backend.api.dto.CreateReviewRequest;
import com.example.backend.model.CartItem;
import com.example.backend.model.OrderRecord;
import com.example.backend.model.ReviewRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AuthService;
import com.example.backend.service.CommerceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommerceController {
    private final AuthService authService;
    private final CommerceService commerceService;

    public CommerceController(AuthService authService, CommerceService commerceService) {
        this.authService = authService;
        this.commerceService = commerceService;
    }

    @GetMapping("/cart")
    public List<CartItem> getCart(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.getCart(user);
    }

    @PostMapping("/cart/add")
    public Map<String, Object> addToCart(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CartAddRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        CommerceService.CartActionResult result = commerceService.addToCart(user, request.getProductId());
        return Map.of(
                "success", result.success(),
                "message", result.message(),
                "items", result.items()
        );
    }

    @PatchMapping("/cart/{itemId}/quantity")
    public List<CartItem> updateQuantity(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String itemId,
            @RequestBody CartUpdateQuantityRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.updateQuantity(user, itemId, request.getDelta());
    }

    @DeleteMapping("/cart/{itemId}")
    public List<CartItem> removeItem(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String itemId
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.removeItem(user, itemId);
    }

    @GetMapping("/orders")
    public List<OrderRecord> getOrders(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.getOrders(user);
    }

    @PostMapping("/orders")
    public OrderRecord createOrder(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.createOrder(user, request);
    }

    @GetMapping("/reviews")
    public List<ReviewRecord> getReviews(@RequestParam String productId) {
        return commerceService.getReviews(productId);
    }

    @PostMapping("/reviews")
    public ReviewRecord createReview(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.createReview(user, request);
    }

    @GetMapping("/downloads")
    public List<CommerceService.DownloadItem> getDownloads(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        return commerceService.getDownloadItems(user);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
