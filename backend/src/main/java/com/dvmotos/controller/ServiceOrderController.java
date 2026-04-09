package com.dvmotos.controller;

import com.dvmotos.dto.request.ServiceOrderItemRequest;
import com.dvmotos.dto.request.ServiceOrderRequest;
import com.dvmotos.dto.response.ServiceOrderResponse;
import com.dvmotos.entity.ServiceOrderStatus;
import com.dvmotos.entity.User;
import com.dvmotos.service.ServiceOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/service-orders")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Service Orders", description = "Service order management")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;

    @GetMapping
    @Operation(summary = "List service orders")
    public ResponseEntity<Page<ServiceOrderResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ServiceOrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(serviceOrderService.findAll(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find service order by ID")
    public ResponseEntity<ServiceOrderResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceOrderService.findById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Find service orders by vehicle")
    public ResponseEntity<Page<ServiceOrderResponse>> findByVehicle(
            @PathVariable Long vehicleId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(serviceOrderService.findByVehicle(vehicleId, pageable));
    }

    @GetMapping("/count")
    @Operation(summary = "Count service orders by status")
    public ResponseEntity<Map<String, Long>> countByStatus(@RequestParam ServiceOrderStatus status) {
        return ResponseEntity.ok(Map.of("count", serviceOrderService.countByStatus(status)));
    }

    @PostMapping
    @Operation(summary = "Create service order")
    public ResponseEntity<ServiceOrderResponse> create(
            @Valid @RequestBody ServiceOrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceOrderService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service order")
    public ResponseEntity<ServiceOrderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ServiceOrderRequest request) {
        return ResponseEntity.ok(serviceOrderService.update(id, request));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add item to service order")
    public ResponseEntity<ServiceOrderResponse> addItem(
            @PathVariable Long id,
            @Valid @RequestBody ServiceOrderItemRequest itemRequest,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceOrderService.addItem(id, itemRequest, currentUser));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Remove item from service order")
    public ResponseEntity<ServiceOrderResponse> removeItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(serviceOrderService.removeItem(id, itemId, currentUser));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change service order status")
    public ResponseEntity<ServiceOrderResponse> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        ServiceOrderStatus newStatus = ServiceOrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(serviceOrderService.changeStatus(id, newStatus, currentUser));
    }
}
