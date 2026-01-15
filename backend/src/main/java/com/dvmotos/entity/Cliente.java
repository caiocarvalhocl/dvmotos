package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "cpf_cnpj", length = 18, unique = true)
    private String cpfCnpj;

    @Column(length = 20)
    private String telefone;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String endereco;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(length = 10)
    private String cep;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Veiculo> veiculos = new ArrayList<>();

    @OneToMany(mappedBy = "cliente")
    @Builder.Default
    private List<OrdemServico> ordensServico = new ArrayList<>();

    // Helper methods
    public void addVeiculo(Veiculo veiculo) {
        veiculos.add(veiculo);
        veiculo.setCliente(this);
    }

    public void removeVeiculo(Veiculo veiculo) {
        veiculos.remove(veiculo);
        veiculo.setCliente(null);
    }
}
