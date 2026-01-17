package com.dvmotos.repository;

import com.dvmotos.entity.ServiceOrder;
import com.dvmotos.entity.ServiceOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    Page<ServiceOrder> findByClientId(Long clientId, Pageable pageable);
    Page<ServiceOrder> findByVehicleId(Long vehicleId, Pageable pageable);
    Page<ServiceOrder> findByStatus(ServiceOrderStatus status, Pageable pageable);
    List<ServiceOrder> findByStatusIn(List<ServiceOrderStatus> statuses);
    @Query("SELECT so FROM ServiceOrder so WHERE so.createdAt BETWEEN :start AND :end")
    List<ServiceOrder> findByPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT COUNT(so) FROM ServiceOrder so WHERE so.status = :status")
    Long countByStatus(@Param("status") ServiceOrderStatus status);
}
