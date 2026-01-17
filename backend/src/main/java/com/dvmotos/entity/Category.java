package com.dvmotos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category extends BaseEntity {
    @Column(nullable = false, length = 100, unique = true)
    private String name;
    @Column(length = 255)
    private String description;
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    @OneToMany(mappedBy = "category")
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}
