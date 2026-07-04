package com.example.backend.api;

import com.example.backend.model.OrderRecord;
import com.example.backend.model.UserAccount;
import com.example.backend.service.AuthService;
import com.example.backend.service.CommerceService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import jakarta.validation.Valid;
import com.example.backend.api.dto.UpdateOrderStatusRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@org.springframework.validation.annotation.Validated
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final AuthService authService;
    private final CommerceService commerceService;

    public AdminOrderController(AuthService authService, CommerceService commerceService) {
        this.authService = authService;
        this.commerceService = commerceService;
    }

    @GetMapping
    public List<OrderRecord> listOrders(@RequestHeader("Authorization") String authorization) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);
        return commerceService.getAllOrders();
    }

    @PatchMapping("/{orderId}/status")
    public OrderRecord updateStatus(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("orderId") String orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        UserAccount user = authService.getRequiredUser(authorization);
        requireAdmin(user);

        String status = request.getStatus();
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status khong hop le");
        }
        return commerceService.updateOrderStatus(orderId, status);
    }

    private void requireAdmin(UserAccount user) {
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ban khong co quyen quan tri");
        }
    }
}
