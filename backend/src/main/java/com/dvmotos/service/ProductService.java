package com.dvmotos.service;

import com.dvmotos.dto.request.ProductRequest;
import com.dvmotos.dto.request.StockMovementRequest;
import com.dvmotos.dto.response.ProductResponse;
import com.dvmotos.dto.response.StockMovementResponse;
import com.dvmotos.entity.*;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.CategoryRepository;
import com.dvmotos.repository.ProductRepository;
import com.dvmotos.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(String search, Boolean active, Pageable pageable) {
        Page<Product> products;
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasSearch && active != null) {
            products = productRepository.searchWithStatus(search.trim(), active, pageable);
        } else if (hasSearch) {
            products = productRepository.searchAll(search.trim(), pageable);
        } else if (active != null) {
            products = productRepository.findByActive(active, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.fromEntity(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    @Transactional(readOnly = true)
    public ProductResponse findByBarcode(String barcode) {
        return ProductResponse.fromEntity(productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode)));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findLowStock() {
        return productRepository.findLowStockProducts().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long countLowStock() {
        return productRepository.countLowStockProducts();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (request.getBarcode() != null && !request.getBarcode().isBlank()
                && productRepository.existsByBarcode(request.getBarcode())) {
            throw new BusinessException("Já existe um produto com este código de barras");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .barcode(request.getBarcode())
                .category(category)
                .costPrice(request.getCostPrice())
                .salePrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .minimumStock(request.getMinimumStock() != null ? request.getMinimumStock() : 0)
                .unit(request.getUnit() != null ? request.getUnit() : "UN")
                .build();

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (request.getBarcode() != null && !request.getBarcode().isBlank()
                && !productRepository.findByBarcodeAndIdNot(request.getBarcode(), id).isEmpty()) {
            throw new BusinessException("Já existe um produto com este código de barras");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBarcode(request.getBarcode());
        product.setCategory(category);
        product.setCostPrice(request.getCostPrice());
        product.setSalePrice(request.getSalePrice());
        product.setMinimumStock(request.getMinimumStock() != null ? request.getMinimumStock() : 0);
        product.setUnit(request.getUnit() != null ? request.getUnit() : "UN");
        // Nota: stockQuantity não é atualizado diretamente, use movimentações

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse toggleStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(!product.getActive());
        return ProductResponse.fromEntity(productRepository.save(product));
    }

    // ============ STOCK MOVEMENTS ============

    @Transactional
    public StockMovementResponse addStockMovement(Long productId, StockMovementRequest request, User currentUser) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        int previousQty = product.getStockQuantity();
        int newQty;

        switch (request.getType()) {
            case IN:
                newQty = previousQty + request.getQuantity();
                break;
            case OUT:
                if (previousQty < request.getQuantity()) {
                    throw new BusinessException("Estoque insuficiente. Disponível: " + previousQty);
                }
                newQty = previousQty - request.getQuantity();
                break;
            case ADJUSTMENT:
                newQty = request.getQuantity(); // Ajuste direto para o valor informado
                break;
            default:
                throw new BusinessException("Tipo de movimentação inválido");
        }

        StockMovement movement = StockMovement.builder()
                .product(product)
                .type(request.getType())
                .quantity(request.getQuantity())
                .previousQuantity(previousQty)
                .newQuantity(newQty)
                .reason(request.getReason())
                .user(currentUser)
                .build();

        product.setStockQuantity(newQty);
        productRepository.save(product);

        return StockMovementResponse.fromEntity(stockMovementRepository.save(movement));
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getStockMovements(Long productId, Pageable pageable) {
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(StockMovementResponse::fromEntity);
    }
}
