package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "license_plate", nullable = false, length = 10, unique = true)
    private String licensePlate;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(length = 4)
    private String year;

    @Column(length = 30)
    private String color;

    @Column(name = "chassis_number", length = 30, unique = true)
    private String chassisNumber;

    @Column(name = "current_mileage")
    private Integer currentMileage;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "vehicle")
    @Builder.Default
    private List<ServiceOrder> serviceOrders = new ArrayList<>();
}
