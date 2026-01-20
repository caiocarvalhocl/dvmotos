package com.dvmotos.dto.response;

import com.dvmotos.entity.Product;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String barcode;
    private Long categoryId;
    private String categoryName;
    private BigDecimal costPrice;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private Integer minimumStock;
    private String unit;
    private Boolean active;
    private Boolean lowStock;
    private LocalDateTime createdAt;

    public static ProductResponse fromEntity(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .barcode(product.getBarcode())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .costPrice(product.getCostPrice())
                .salePrice(product.getSalePrice())
                .stockQuantity(product.getStockQuantity())
                .minimumStock(product.getMinimumStock())
                .unit(product.getUnit())
                .active(product.getActive())
                .lowStock(product.isLowStock())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
