package com.dvmotos.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String name;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @Size(max = 50, message = "Código de barras deve ter no máximo 50 caracteres")
    private String barcode;

    private Long categoryId;

    @DecimalMin(value = "0.00", message = "Preço de custo deve ser positivo")
    private BigDecimal costPrice;

    @NotNull(message = "Preço de venda é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço de venda deve ser maior que zero")
    private BigDecimal salePrice;

    @NotNull(message = "Quantidade em estoque é obrigatória")
    @Min(value = 0, message = "Quantidade não pode ser negativa")
    private Integer stockQuantity;

    @Min(value = 0, message = "Estoque mínimo não pode ser negativo")
    private Integer minimumStock = 0;

    @Size(max = 10, message = "Unidade deve ter no máximo 10 caracteres")
    private String unit = "UN";
}
