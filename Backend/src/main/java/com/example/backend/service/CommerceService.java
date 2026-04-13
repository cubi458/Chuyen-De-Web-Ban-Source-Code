package com.example.backend.service;

import com.example.backend.api.dto.CreateOrderRequest;
import com.example.backend.api.dto.CreateReviewRequest;
import com.example.backend.model.CartItem;
import com.example.backend.model.OrderItem;
import com.example.backend.model.OrderRecord;
import com.example.backend.model.ReviewRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.OrderRecordRepository;
import com.example.backend.repository.ReviewRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CommerceService {
    private final CartItemRepository cartItemRepository;
    private final OrderRecordRepository orderRecordRepository;
    private final ReviewRecordRepository reviewRecordRepository;

    public CommerceService(
            CartItemRepository cartItemRepository,
            OrderRecordRepository orderRecordRepository,
            ReviewRecordRepository reviewRecordRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.orderRecordRepository = orderRecordRepository;
        this.reviewRecordRepository = reviewRecordRepository;
    }

    public List<CartItem> getCart(UserAccount user) {
        return cartItemRepository.findByUserIdOrderByIdDesc(user.getId());
    }

    public CartActionResult addToCart(UserAccount user, String productId) {
        if (productId == null || productId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productId khong hop le");
        }

        CartItem existing = cartItemRepository.findByUserIdAndProductId(user.getId(), productId).orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + 1);
            cartItemRepository.save(existing);
        } else {
            CartItem item = new CartItem();
            item.setId("cart-" + UUID.randomUUID());
            item.setUserId(user.getId());
            item.setProductId(productId);
            item.setQuantity(1);
            item.setLicense("personal");
            item.setSupportPlan("standard");
            cartItemRepository.save(item);
        }

        return new CartActionResult(true, "Da them san pham vao gio hang", getCart(user));
    }

    public List<CartItem> updateQuantity(UserAccount user, String itemId, int delta) {
        CartItem target = cartItemRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay item trong gio hang"));

        target.setQuantity(Math.max(1, target.getQuantity() + delta));
        cartItemRepository.save(target);
        return getCart(user);
    }

    public List<CartItem> removeItem(UserAccount user, String itemId) {
        cartItemRepository.deleteByIdAndUserId(itemId, user.getId());
        return getCart(user);
    }

    public OrderRecord createOrder(UserAccount user, CreateOrderRequest request) {
        OrderRecord order = new OrderRecord();
        order.setId("ord-" + UUID.randomUUID().toString().substring(0, 8));
        order.setUserId(user.getId());
        order.setUserEmail(user.getEmail());
        order.setUserName(user.getDisplayName());
        order.setSubtotal(request.getSubtotal());
        order.setDiscountCode(request.getDiscountCode());
        order.setDiscountAmount(request.getDiscountAmount());
        order.setTotal(request.getTotal());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(request.getStatus() == null || request.getStatus().isBlank() ? "paid" : request.getStatus());
        order.setNote(request.getNote());
        order.setCreatedAt(Instant.now());

        List<OrderItem> copiedItems = copyItems(request.getItems());
        order.setItems(copiedItems);

        return orderRecordRepository.save(order);
    }

    public List<OrderRecord> getOrders(UserAccount user) {
        return orderRecordRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
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

        return reviewRecordRepository.save(review);
    }

    public List<ReviewRecord> getReviews(String productId) {
        return reviewRecordRepository.findByProductIdOrderByCreatedAtDesc(productId);
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
            copied.setId("item-" + UUID.randomUUID());
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
