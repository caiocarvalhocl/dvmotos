package com.dvmotos.service;

import com.dvmotos.dto.request.CategoryRequest;
import com.dvmotos.dto.response.CategoryResponse;
import com.dvmotos.entity.Category;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> findAll(String search, Boolean active, Pageable pageable) {
        Page<Category> categories;
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasSearch && active != null) {
            categories = categoryRepository.searchWithStatus(search.trim(), active, pageable);
        } else if (hasSearch) {
            categories = categoryRepository.searchAll(search.trim(), pageable);
        } else if (active != null) {
            categories = categoryRepository.findByActive(active, pageable);
        } else {
            categories = categoryRepository.findAll(pageable);
        }

        return categories.map(CategoryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAllActive() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return CategoryResponse.fromEntity(categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (!categoryRepository.findByNameIgnoreCaseAndIdNot(request.getName(), id).isEmpty()) {
            throw new BusinessException("Já existe uma categoria com este nome");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public CategoryResponse toggleStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(!category.getActive());
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }
}
