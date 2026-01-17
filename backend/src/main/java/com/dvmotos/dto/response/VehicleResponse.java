package com.dvmotos.dto.response;

import com.dvmotos.entity.Vehicle;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private String licensePlate;
    private String brand;
    private String model;
    private String year;
    private String color;
    private String chassisNumber;
    private Integer currentMileage;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId()).clientId(vehicle.getClient().getId())
                .clientName(vehicle.getClient().getName()).licensePlate(vehicle.getLicensePlate())
                .brand(vehicle.getBrand()).model(vehicle.getModel()).year(vehicle.getYear())
                .color(vehicle.getColor()).chassisNumber(vehicle.getChassisNumber())
                .currentMileage(vehicle.getCurrentMileage()).notes(vehicle.getNotes())
                .active(vehicle.getActive()).createdAt(vehicle.getCreatedAt())
                .build();
    }
}
