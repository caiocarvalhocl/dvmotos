package com.dvmotos.dto.request;

import com.dvmotos.entity.MovementType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StockMovementRequest {
    @NotNull(message = "Tipo de movimentação é obrigatório")
    private MovementType type;

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantity;

    @Size(max = 255, message = "Motivo deve ter no máximo 255 caracteres")
    private String reason;
}
