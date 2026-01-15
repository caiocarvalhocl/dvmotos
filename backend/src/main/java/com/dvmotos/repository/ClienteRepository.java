package com.dvmotos.repository;

import com.dvmotos.entity.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    Optional<Cliente> findByCpfCnpj(String cpfCnpj);
    
    boolean existsByCpfCnpj(String cpfCnpj);
    
    @Query("SELECT c FROM Cliente c WHERE c.ativo = true AND " +
           "(LOWER(c.nome) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.cpfCnpj LIKE CONCAT('%', :search, '%') OR " +
           "c.telefone LIKE CONCAT('%', :search, '%'))")
    Page<Cliente> search(@Param("search") String search, Pageable pageable);
    
    Page<Cliente> findByAtivoTrue(Pageable pageable);
}
