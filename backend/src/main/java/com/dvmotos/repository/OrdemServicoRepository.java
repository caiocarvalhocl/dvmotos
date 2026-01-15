package com.dvmotos.repository;

import com.dvmotos.entity.OrdemServico;
import com.dvmotos.entity.StatusOS;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {
    
    Page<OrdemServico> findByClienteId(Long clienteId, Pageable pageable);
    
    Page<OrdemServico> findByVeiculoId(Long veiculoId, Pageable pageable);
    
    Page<OrdemServico> findByStatus(StatusOS status, Pageable pageable);
    
    List<OrdemServico> findByStatusIn(List<StatusOS> statuses);
    
    @Query("SELECT os FROM OrdemServico os WHERE os.createdAt BETWEEN :inicio AND :fim")
    List<OrdemServico> findByPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
    
    @Query("SELECT COUNT(os) FROM OrdemServico os WHERE os.status = :status")
    Long countByStatus(@Param("status") StatusOS status);
    
    @Query("SELECT SUM(os.valorTotal) FROM OrdemServico os WHERE os.status = 'FINALIZADA' AND os.finalizadaAt BETWEEN :inicio AND :fim")
    java.math.BigDecimal sumFaturamentoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
