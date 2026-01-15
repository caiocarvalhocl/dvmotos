package com.dvmotos.repository;

import com.dvmotos.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    List<Categoria> findByAtivoTrue();
    
    boolean existsByNome(String nome);
}
