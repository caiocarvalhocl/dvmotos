package com.dvmotos.dto.response;

import com.dvmotos.entity.ServiceOrder;
import com.dvmotos.entity.ServiceOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ServiceOrderResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long vehicleId;
    private String vehiclePlate;
    private String vehicleModel;
    private Long userId;
    private String userName;
    private ServiceOrderStatus status;
    private Integer entryMileage;
    private BigDecimal servicesAmount;
    private BigDecimal partsAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private List<ServiceOrderItemResponse> items;

    public static ServiceOrderResponse fromEntity(ServiceOrder so) {
        return ServiceOrderResponse.builder()
                .id(so.getId())
                .clientId(so.getClient().getId())
                .clientName(so.getClient().getName())
                .vehicleId(so.getVehicle().getId())
                .vehiclePlate(so.getVehicle().getLicensePlate())
                .vehicleModel(so.getVehicle().getBrand() + " " + so.getVehicle().getModel())
                .userId(so.getUser().getId())
                .userName(so.getUser().getName())
                .status(so.getStatus())
                .entryMileage(so.getEntryMileage())
                .servicesAmount(so.getServicesAmount())
                .partsAmount(so.getPartsAmount())
                .discountAmount(so.getDiscountAmount())
                .totalAmount(so.getTotalAmount())
                .notes(so.getNotes())
                .createdAt(so.getCreatedAt())
                .completedAt(so.getCompletedAt())
                .items(so.getItems().stream()
                        .map(ServiceOrderItemResponse::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
