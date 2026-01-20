package com.dvmotos.service;

import com.dvmotos.dto.request.CategoryRequest;
import com.dvmotos.dto.response.CategoryResponse;
import com.dvmotos.entity.Category;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

  @Mock
  private CategoryRepository categoryRepository;

  @InjectMocks
  private CategoryService categoryService;

  private Category category;
  private CategoryRequest categoryRequest;
  private Pageable pageable;

  @BeforeEach
  void setUp() {
    category = Category.builder()
        .id(1L)
        .name("Óleo e Lubrificantes")
        .description("Óleos de motor e lubrificantes")
        .active(true)
        .products(Collections.emptyList())
        .build();

    categoryRequest = new CategoryRequest();
    categoryRequest.setName("Óleo e Lubrificantes");
    categoryRequest.setDescription("Óleos de motor e lubrificantes");

    pageable = PageRequest.of(0, 20);
  }

  @Nested
  @DisplayName("findAll")
  class FindAll {

    @Test
    @DisplayName("deve retornar todas as categorias")
    void shouldReturnAllCategories() {
      Page<Category> page = new PageImpl<>(List.of(category));
      when(categoryRepository.findAll(pageable)).thenReturn(page);

      Page<CategoryResponse> result = categoryService.findAll(null, null, pageable);

      assertThat(result.getContent()).hasSize(1);
      assertThat(result.getContent().get(0).getName()).isEqualTo("Óleo e Lubrificantes");
      verify(categoryRepository).findAll(pageable);
    }

    @Test
    @DisplayName("deve filtrar por status ativo")
    void shouldFilterByActiveStatus() {
      Page<Category> page = new PageImpl<>(List.of(category));
      when(categoryRepository.findByActive(true, pageable)).thenReturn(page);

      Page<CategoryResponse> result = categoryService.findAll(null, true, pageable);

      assertThat(result.getContent()).hasSize(1);
      verify(categoryRepository).findByActive(true, pageable);
    }

    @Test
    @DisplayName("deve buscar por termo")
    void shouldSearchByTerm() {
      Page<Category> page = new PageImpl<>(List.of(category));
      when(categoryRepository.searchAll("óleo", pageable)).thenReturn(page);

      Page<CategoryResponse> result = categoryService.findAll("óleo", null, pageable);

      assertThat(result.getContent()).hasSize(1);
      verify(categoryRepository).searchAll("óleo", pageable);
    }

    @Test
    @DisplayName("deve buscar por termo e status")
    void shouldSearchByTermAndStatus() {
      Page<Category> page = new PageImpl<>(List.of(category));
      when(categoryRepository.searchWithStatus("óleo", true, pageable)).thenReturn(page);

      Page<CategoryResponse> result = categoryService.findAll("óleo", true, pageable);

      assertThat(result.getContent()).hasSize(1);
      verify(categoryRepository).searchWithStatus("óleo", true, pageable);
    }
  }

  @Nested
  @DisplayName("findById")
  class FindById {

    @Test
    @DisplayName("deve retornar categoria quando encontrada")
    void shouldReturnCategoryWhenFound() {
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

      CategoryResponse result = categoryService.findById(1L);

      assertThat(result.getId()).isEqualTo(1L);
      assertThat(result.getName()).isEqualTo("Óleo e Lubrificantes");
    }

    @Test
    @DisplayName("deve lançar exceção quando não encontrada")
    void shouldThrowExceptionWhenNotFound() {
      when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> categoryService.findById(99L))
          .isInstanceOf(ResourceNotFoundException.class);
    }
  }

  @Nested
  @DisplayName("create")
  class Create {

    @Test
    @DisplayName("deve criar categoria com sucesso")
    void shouldCreateCategorySuccessfully() {
      when(categoryRepository.existsByNameIgnoreCase("Óleo e Lubrificantes")).thenReturn(false);
      when(categoryRepository.save(any(Category.class))).thenReturn(category);

      CategoryResponse result = categoryService.create(categoryRequest);

      assertThat(result.getName()).isEqualTo("Óleo e Lubrificantes");
      verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando nome duplicado")
    void shouldThrowExceptionWhenNameDuplicated() {
      when(categoryRepository.existsByNameIgnoreCase("Óleo e Lubrificantes")).thenReturn(true);

      assertThatThrownBy(() -> categoryService.create(categoryRequest))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Já existe uma categoria com este nome");

      verify(categoryRepository, never()).save(any());
    }
  }

  @Nested
  @DisplayName("update")
  class Update {

    @Test
    @DisplayName("deve atualizar categoria com sucesso")
    void shouldUpdateCategorySuccessfully() {
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
      when(categoryRepository.findByNameIgnoreCaseAndIdNot("Óleo e Lubrificantes", 1L))
          .thenReturn(Collections.emptyList());
      when(categoryRepository.save(any(Category.class))).thenReturn(category);

      CategoryResponse result = categoryService.update(1L, categoryRequest);

      assertThat(result.getName()).isEqualTo("Óleo e Lubrificantes");
      verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando nome duplicado em outra categoria")
    void shouldThrowExceptionWhenNameDuplicatedInOther() {
      Category otherCategory = Category.builder().id(2L).name("Óleo e Lubrificantes").build();
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
      when(categoryRepository.findByNameIgnoreCaseAndIdNot("Óleo e Lubrificantes", 1L))
          .thenReturn(List.of(otherCategory));

      assertThatThrownBy(() -> categoryService.update(1L, categoryRequest))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Já existe uma categoria com este nome");
    }
  }

  @Nested
  @DisplayName("toggleStatus")
  class ToggleStatus {

    @Test
    @DisplayName("deve desativar categoria ativa")
    void shouldDeactivateActiveCategory() {
      category.setActive(true);
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
      when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

      CategoryResponse result = categoryService.toggleStatus(1L);

      assertThat(result.getActive()).isFalse();
    }

    @Test
    @DisplayName("deve ativar categoria inativa")
    void shouldActivateInactiveCategory() {
      category.setActive(false);
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
      when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

      CategoryResponse result = categoryService.toggleStatus(1L);

      assertThat(result.getActive()).isTrue();
    }
  }
}
