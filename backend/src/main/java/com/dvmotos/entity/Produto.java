package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "codigo_barras", length = 50, unique = true)
    private String codigoBarras;

    @Column(name = "preco_custo", precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Column(name = "preco_venda", precision = 10, scale = 2, nullable = false)
    private BigDecimal precoVenda;

    @Column(name = "qtd_estoque", nullable = false)
    @Builder.Default
    private Integer qtdEstoque = 0;

    @Column(name = "qtd_minima")
    @Builder.Default
    private Integer qtdMinima = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "produto")
    @Builder.Default
    private List<MovimentacaoEstoque> movimentacoes = new ArrayList<>();

    // Helper method
    public boolean isEstoqueBaixo() {
        return qtdEstoque <= qtdMinima;
    }
}
