package com.dvmotos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class ServiceOrderRequest {

    @NotNull(message = "Cliente é obrigatório")
    private Long clientId;

    @NotNull(message = "Veículo é obrigatório")
    private Long vehicleId;

    private Integer entryMileage;

    @Size(max = 2000, message = "Observações devem ter no máximo 2000 caracteres")
    private String notes;

    @DecimalMin(value = "0.00", message = "Desconto deve ser positivo")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Valid
    private List<ServiceOrderItemRequest> items = new ArrayList<>();
}
