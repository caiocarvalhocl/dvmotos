package com.dvmotos.repository;

import com.dvmotos.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByChassisNumber(String chassisNumber);

    List<Vehicle> findByClientIdAndActiveTrue(Long clientId);

    Page<Vehicle> findByActive(Boolean active, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Vehicle> searchAll(@Param("search") String search, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE v.active = :active AND (LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vehicle> searchWithStatus(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    Page<Vehicle> findByActiveTrue(Pageable pageable);

    @Query("SELECT COUNT(1) FROM Vehicle v WHERE v.active = true")
    Long countActiveVehicles();
}
