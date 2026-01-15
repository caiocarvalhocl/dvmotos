package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordens_servico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdemServico extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusOS status = StatusOS.ABERTA;

    @Column(name = "km_entrada")
    private Integer kmEntrada;

    @Column(name = "valor_servicos", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorServicos = BigDecimal.ZERO;

    @Column(name = "valor_pecas", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorPecas = BigDecimal.ZERO;

    @Column(name = "valor_desconto", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "finalizada_at")
    private LocalDateTime finalizadaAt;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemOS> itens = new ArrayList<>();

    // Helper methods
    public void addItem(ItemOS item) {
        itens.add(item);
        item.setOrdemServico(this);
        recalcularTotal();
    }

    public void removeItem(ItemOS item) {
        itens.remove(item);
        item.setOrdemServico(null);
        recalcularTotal();
    }

    public void recalcularTotal() {
        this.valorServicos = itens.stream()
                .filter(item -> item.getTipo() == TipoItemOS.SERVICO)
                .map(ItemOS::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorPecas = itens.stream()
                .filter(item -> item.getTipo() == TipoItemOS.PECA)
                .map(ItemOS::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorTotal = this.valorServicos
                .add(this.valorPecas)
                .subtract(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
    }

    public void finalizar() {
        this.status = StatusOS.FINALIZADA;
        this.finalizadaAt = LocalDateTime.now();
    }
}
