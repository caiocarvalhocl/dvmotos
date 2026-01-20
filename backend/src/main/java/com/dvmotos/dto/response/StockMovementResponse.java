package com.dvmotos.dto.response;

import com.dvmotos.entity.MovementType;
import com.dvmotos.entity.StockMovement;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private MovementType type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private String userName;
    private LocalDateTime createdAt;

    public static StockMovementResponse fromEntity(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .productName(movement.getProduct().getName())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .previousQuantity(movement.getPreviousQuantity())
                .newQuantity(movement.getNewQuantity())
                .reason(movement.getReason())
                .userName(movement.getUser() != null ? movement.getUser().getName() : null)
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
