package com.dvmotos.repository;

import com.dvmotos.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByDocumentNumber(String documentNumber);

    boolean existsByDocumentNumber(String documentNumber);

    Page<Client> findByActive(Boolean active, Pageable pageable);

    @Query("SELECT c FROM Client c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.documentNumber LIKE CONCAT('%', :search, '%') OR c.phone LIKE CONCAT('%', :search, '%')")
    Page<Client> searchAll(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Client c WHERE c.active = :active AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.documentNumber LIKE CONCAT('%', :search, '%') OR c.phone LIKE CONCAT('%', :search, '%'))")
    Page<Client> searchWithStatus(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    Page<Client> findByActiveTrue(Pageable pageable);
}
