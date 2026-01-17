package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceOrder extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default
    private ServiceOrderStatus status = ServiceOrderStatus.OPEN;
    @Column(name = "entry_mileage")
    private Integer entryMileage;
    @Column(name = "services_amount", precision = 10, scale = 2) @Builder.Default
    private BigDecimal servicesAmount = BigDecimal.ZERO;
    @Column(name = "parts_amount", precision = 10, scale = 2) @Builder.Default
    private BigDecimal partsAmount = BigDecimal.ZERO;
    @Column(name = "discount_amount", precision = 10, scale = 2) @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    @Column(name = "total_amount", precision = 10, scale = 2) @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true) @Builder.Default
    private List<ServiceOrderItem> items = new ArrayList<>();
}
