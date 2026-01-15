package com.dvmotos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VeiculoRequest {
    
    @NotNull(message = "Cliente é obrigatório")
    private Long clienteId;
    
    @NotBlank(message = "Placa é obrigatória")
    @Size(max = 10, message = "Placa deve ter no máximo 10 caracteres")
    private String placa;
    
    @NotBlank(message = "Marca é obrigatória")
    @Size(max = 50, message = "Marca deve ter no máximo 50 caracteres")
    private String marca;
    
    @NotBlank(message = "Modelo é obrigatório")
    @Size(max = 50, message = "Modelo deve ter no máximo 50 caracteres")
    private String modelo;
    
    @Size(max = 4, message = "Ano deve ter no máximo 4 caracteres")
    private String ano;
    
    @Size(max = 30, message = "Cor deve ter no máximo 30 caracteres")
    private String cor;
    
    @Size(max = 30, message = "Chassi deve ter no máximo 30 caracteres")
    private String chassi;
    
    private Integer kmAtual;
    
    private String observacoes;
}
