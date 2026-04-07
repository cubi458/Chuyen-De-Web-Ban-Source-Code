package com.example.backend.service;

import com.example.backend.api.dto.CreateOrderRequest;
import com.example.backend.api.dto.CreateReviewRequest;
import com.example.backend.model.CartItem;
import com.example.backend.model.OrderItem;
import com.example.backend.model.OrderRecord;
import com.example.backend.model.ReviewRecord;
import com.example.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CommerceService {
    private final Map<String, List<CartItem>> cartsByUser = new ConcurrentHashMap<>();
    private final Map<String, List<OrderRecord>> ordersByUser = new ConcurrentHashMap<>();
    private final Map<String, List<ReviewRecord>> reviewsByProduct = new ConcurrentHashMap<>();

    public List<CartItem> getCart(UserAccount user) {
        return new ArrayList<>(cartsByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>()));
    }

    public CartActionResult addToCart(UserAccount user, String productId) {
        if (productId == null || productId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productId khong hop le");
        }

        List<CartItem> cart = cartsByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>());
        CartItem existing = cart.stream().filter(item -> item.getProductId().equals(productId)).findFirst().orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + 1);
        } else {
            CartItem item = new CartItem();
            item.setId("cart-" + UUID.randomUUID());
            item.setProductId(productId);
            item.setQuantity(1);
            item.setLicense("personal");
            item.setSupportPlan("standard");
            cart.add(item);
        }

        return new CartActionResult(true, "Da them san pham vao gio hang", new ArrayList<>(cart));
    }

    public List<CartItem> updateQuantity(UserAccount user, String itemId, int delta) {
        List<CartItem> cart = cartsByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>());
        CartItem target = cart.stream().filter(item -> item.getId().equals(itemId)).findFirst().orElse(null);
        if (target == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay item trong gio hang");
        }
        target.setQuantity(Math.max(1, target.getQuantity() + delta));
        return new ArrayList<>(cart);
    }

    public List<CartItem> removeItem(UserAccount user, String itemId) {
        List<CartItem> cart = cartsByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>());
        cart.removeIf(item -> item.getId().equals(itemId));
        return new ArrayList<>(cart);
    }

    public OrderRecord createOrder(UserAccount user, CreateOrderRequest request) {
        OrderRecord order = new OrderRecord();
        order.setId("ord-" + UUID.randomUUID().toString().substring(0, 8));
        order.setUserId(user.getId());
        order.setUserEmail(user.getEmail());
        order.setUserName(user.getDisplayName());
        order.setItems(copyItems(request.getItems()));
        order.setSubtotal(request.getSubtotal());
        order.setDiscountCode(request.getDiscountCode());
        order.setDiscountAmount(request.getDiscountAmount());
        order.setTotal(request.getTotal());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(request.getStatus() == null || request.getStatus().isBlank() ? "paid" : request.getStatus());
        order.setNote(request.getNote());
        order.setCreatedAt(Instant.now());

        List<OrderRecord> userOrders = ordersByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>());
        userOrders.add(0, order);
        return order;
    }

    public List<OrderRecord> getOrders(UserAccount user) {
        List<OrderRecord> orders = new ArrayList<>(ordersByUser.computeIfAbsent(user.getId(), ignored -> new ArrayList<>()));
        orders.sort(Comparator.comparing(OrderRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return orders;
    }

    public ReviewRecord createReview(UserAccount user, CreateReviewRequest request) {
        ReviewRecord review = new ReviewRecord();
        review.setId("rev-" + UUID.randomUUID().toString().substring(0, 8));
        review.setProductId(request.getProductId());
        review.setUserId(user.getId());
        review.setUserName(user.getDisplayName() == null || user.getDisplayName().isBlank() ? user.getEmail() : user.getDisplayName());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setCreatedAt(Instant.now());

        List<ReviewRecord> productReviews = reviewsByProduct.computeIfAbsent(request.getProductId(), ignored -> new ArrayList<>());
        productReviews.add(0, review);
        return review;
    }

    public List<ReviewRecord> getReviews(String productId) {
        List<ReviewRecord> reviews = new ArrayList<>(reviewsByProduct.computeIfAbsent(productId, ignored -> new ArrayList<>()));
        reviews.sort(Comparator.comparing(ReviewRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return reviews;
    }

    public List<DownloadItem> getDownloadItems(UserAccount user) {
        List<OrderRecord> orders = getOrders(user);
        List<DownloadItem> result = new ArrayList<>();
        for (OrderRecord order : orders) {
            if (!"paid".equalsIgnoreCase(order.getStatus())) {
                continue;
            }
            for (OrderItem item : order.getItems()) {
                result.add(new DownloadItem(
                        order.getId(),
                        item.getProductId(),
                        item.getProductTitle(),
                        item.getLicense(),
                        order.getCreatedAt(),
                        "https://example.com/download/" + item.getProductId() + ".zip"
                ));
            }
        }
        return result;
    }

    private List<OrderItem> copyItems(List<OrderItem> source) {
        List<OrderItem> out = new ArrayList<>();
        if (source == null) {
            return out;
        }
        for (OrderItem item : source) {
            OrderItem copied = new OrderItem();
            copied.setProductId(item.getProductId());
            copied.setProductTitle(item.getProductTitle());
            copied.setPrice(item.getPrice());
            copied.setQuantity(item.getQuantity());
            copied.setLicense(item.getLicense());
            out.add(copied);
        }
        return out;
    }

    public record CartActionResult(boolean success, String message, List<CartItem> items) {
    }

    public record DownloadItem(
            String orderId,
            String productId,
            String productTitle,
            String license,
            Instant purchasedAt,
            String downloadUrl
    ) {
    }
}
