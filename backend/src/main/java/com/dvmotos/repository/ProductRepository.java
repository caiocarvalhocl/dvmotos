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

    @Query("SELECT p FROM Product p WHERE p.id <> :id AND p.barcode = :barcode")
    List<Product> findByBarcodeAndIdNot(@Param("barcode") String barcode, @Param("id") Long id);

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    Page<Product> findByActive(Boolean active, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR p.barcode LIKE CONCAT('%', :search, '%')")
    Page<Product> searchAll(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = :active AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR p.barcode LIKE CONCAT('%', :search, '%'))")
    Page<Product> searchWithStatus(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity <= p.minimumStock")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.stockQuantity <= p.minimumStock")
    Long countLowStockProducts();
}
