package com.dvmotos.dto.response;

import com.dvmotos.entity.Category;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private Integer totalProducts;
    private LocalDateTime createdAt;

    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .totalProducts(category.getProducts() != null
                        ? (int) category.getProducts().stream().filter(p -> p.getActive()).count()
                        : 0)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
