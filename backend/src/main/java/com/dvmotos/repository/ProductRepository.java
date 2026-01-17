package com.dvmotos.repository;

import com.dvmotos.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity <= p.minimumStock")
    List<Product> findLowStockProducts();
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR p.barcode LIKE CONCAT('%', :search, '%'))")
    Page<Product> search(@Param("search") String search, Pageable pageable);
    Page<Product> findByActiveTrue(Pageable pageable);
}
