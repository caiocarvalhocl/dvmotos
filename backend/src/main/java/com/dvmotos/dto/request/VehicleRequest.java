package com.dvmotos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotNull(message = "Client is required") private Long clientId;
    @NotBlank(message = "License plate is required") @Size(max = 10) private String licensePlate;
    @NotBlank(message = "Brand is required") @Size(max = 50) private String brand;
    @NotBlank(message = "Model is required") @Size(max = 50) private String model;
    @Size(max = 4) private String year;
    @Size(max = 30) private String color;
    @Size(max = 30) private String chassisNumber;
    private Integer currentMileage;
    private String notes;
}
