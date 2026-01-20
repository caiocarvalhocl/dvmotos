package com.dvmotos.controller;

import com.dvmotos.dto.request.ProductRequest;
import com.dvmotos.dto.request.StockMovementRequest;
import com.dvmotos.dto.response.ProductResponse;
import com.dvmotos.dto.response.StockMovementResponse;
import com.dvmotos.entity.User;
import com.dvmotos.service.ProductService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Products", description = "Product and stock management")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List products")
    public ResponseEntity<Page<ProductResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(productService.findAll(search, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find product by ID")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping("/barcode/{barcode}")
    @Operation(summary = "Find product by barcode")
    public ResponseEntity<ProductResponse> findByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.findByBarcode(barcode));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "List products with low stock")
    public ResponseEntity<List<ProductResponse>> findLowStock() {
        return ResponseEntity.ok(productService.findLowStock());
    }

    @GetMapping("/low-stock/count")
    @Operation(summary = "Count products with low stock")
    public ResponseEntity<Map<String, Long>> countLowStock() {
        return ResponseEntity.ok(Map.of("count", productService.countLowStock()));
    }

    @PostMapping
    @Operation(summary = "Create product")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate product")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle product status")
    public ResponseEntity<ProductResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleStatus(id));
    }

    // ============ STOCK MOVEMENTS ============

    @PostMapping("/{id}/stock")
    @Operation(summary = "Add stock movement")
    public ResponseEntity<StockMovementResponse> addStockMovement(
            @PathVariable Long id,
            @Valid @RequestBody StockMovementRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addStockMovement(id, request, currentUser));
    }

    @GetMapping("/{id}/stock/history")
    @Operation(summary = "Get stock movement history")
    public ResponseEntity<Page<StockMovementResponse>> getStockHistory(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(productService.getStockMovements(id, pageable));
    }
}
