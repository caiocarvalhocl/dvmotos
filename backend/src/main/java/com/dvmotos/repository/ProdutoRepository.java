package com.dvmotos.repository;

import com.dvmotos.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
    Optional<Produto> findByCodigoBarras(String codigoBarras);
    
    boolean existsByCodigoBarras(String codigoBarras);
    
    List<Produto> findByCategoriaIdAndAtivoTrue(Long categoriaId);
    
    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND p.qtdEstoque <= p.qtdMinima")
    List<Produto> findProdutosComEstoqueBaixo();
    
    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND " +
           "(LOWER(p.nome) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "p.codigoBarras LIKE CONCAT('%', :search, '%'))")
    Page<Produto> search(@Param("search") String search, Pageable pageable);
    
    Page<Produto> findByAtivoTrue(Pageable pageable);
}
