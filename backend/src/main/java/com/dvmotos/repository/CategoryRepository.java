package com.dvmotos.repository;

import com.dvmotos.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT c FROM Category c WHERE c.id <> :id AND LOWER(c.name) = LOWER(:name)")
    List<Category> findByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

    List<Category> findByActiveTrueOrderByNameAsc();

    Page<Category> findByActive(Boolean active, Pageable pageable);

    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Category> searchAll(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.active = :active AND LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Category> searchWithStatus(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
}
