package com.dvmotos.dto.response;

import com.dvmotos.entity.ServiceOrderItem;
import com.dvmotos.entity.ServiceOrderItemType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServiceOrderItemResponse {
    private Long id;
    private ServiceOrderItemType type;
    private Long productId;
    private String productName;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public static ServiceOrderItemResponse fromEntity(ServiceOrderItem item) {
        return ServiceOrderItemResponse.builder()
                .id(item.getId())
                .type(item.getType())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
