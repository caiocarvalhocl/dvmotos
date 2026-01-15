package com.dvmotos.repository;

import com.dvmotos.entity.Veiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
    
    Optional<Veiculo> findByPlaca(String placa);
    
    boolean existsByPlaca(String placa);
    
    boolean existsByChassi(String chassi);
    
    List<Veiculo> findByClienteIdAndAtivoTrue(Long clienteId);
    
    @Query("SELECT v FROM Veiculo v WHERE v.ativo = true AND " +
           "(LOWER(v.placa) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.marca) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.modelo) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Veiculo> search(@Param("search") String search, Pageable pageable);
    
    Page<Veiculo> findByAtivoTrue(Pageable pageable);
}
