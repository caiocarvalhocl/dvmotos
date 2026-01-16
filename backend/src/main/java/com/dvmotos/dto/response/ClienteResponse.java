package com.dvmotos.dto.response;

import com.dvmotos.entity.Cliente;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResponse {

    private Long id;
    private String nome;
    private String cpfCnpj;
    private String telefone;
    private String email;
    private String endereco;
    private String cidade;
    private String estado;
    private String cep;
    private String observacoes;
    private Boolean ativo;
    private LocalDateTime createdAt;
    private Integer totalVeiculos;

    public static ClienteResponse fromEntity(Cliente cliente) {
        return ClienteResponse.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cpfCnpj(cliente.getCpfCnpj())
                .telefone(cliente.getTelefone())
                .email(cliente.getEmail())
                .endereco(cliente.getEndereco())
                .cidade(cliente.getCidade())
                .estado(cliente.getEstado())
                .cep(cliente.getCep())
                .observacoes(cliente.getObservacoes())
                .ativo(cliente.getAtivo())
                .createdAt(cliente.getCreatedAt())
                .totalVeiculos(cliente.getVeiculos() != null ? cliente.getVeiculos().size() : 0)
                .build();
    }
}
