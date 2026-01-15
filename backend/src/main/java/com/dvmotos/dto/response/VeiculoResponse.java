package com.dvmotos.dto.response;

import com.dvmotos.entity.Veiculo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VeiculoResponse {
    
    private Long id;
    private Long clienteId;
    private String clienteNome;
    private String placa;
    private String marca;
    private String modelo;
    private String ano;
    private String cor;
    private String chassi;
    private Integer kmAtual;
    private String observacoes;
    private Boolean ativo;
    private LocalDateTime createdAt;
    
    public static VeiculoResponse fromEntity(Veiculo veiculo) {
        return VeiculoResponse.builder()
                .id(veiculo.getId())
                .clienteId(veiculo.getCliente().getId())
                .clienteNome(veiculo.getCliente().getNome())
                .placa(veiculo.getPlaca())
                .marca(veiculo.getMarca())
                .modelo(veiculo.getModelo())
                .ano(veiculo.getAno())
                .cor(veiculo.getCor())
                .chassi(veiculo.getChassi())
                .kmAtual(veiculo.getKmAtual())
                .observacoes(veiculo.getObservacoes())
                .ativo(veiculo.getAtivo())
                .createdAt(veiculo.getCreatedAt())
                .build();
    }
}
