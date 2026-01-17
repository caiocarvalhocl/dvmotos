package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @Column(length = 50, unique = true)
    private String barcode;
    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;
    @Column(name = "sale_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal salePrice;
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;
    @Column(name = "minimum_stock")
    @Builder.Default
    private Integer minimumStock = 5;
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<StockMovement> movements = new ArrayList<>();
    public boolean isLowStock() { return stockQuantity <= minimumStock; }
}
