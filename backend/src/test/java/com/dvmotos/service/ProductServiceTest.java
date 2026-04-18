package com.dvmotos.service;

import com.dvmotos.dto.request.ProductRequest;
import com.dvmotos.dto.request.StockMovementRequest;
import com.dvmotos.dto.response.ProductResponse;
import com.dvmotos.dto.response.StockMovementResponse;
import com.dvmotos.entity.*;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.CategoryRepository;
import com.dvmotos.repository.ProductRepository;
import com.dvmotos.repository.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock
  private ProductRepository productRepository;

  @Mock
  private CategoryRepository categoryRepository;

  @Mock
  private StockMovementRepository stockMovementRepository;

  @InjectMocks
  private ProductService productService;

  private Product product;
  private Category category;
  private ProductRequest productRequest;
  private User user;

  @BeforeEach
  void setUp() {
    category = Category.builder()
        .name("Óleo e Lubrificantes")
        .active(true)
        .build();
    category.setId(1L);

    product = Product.builder()
        .name("Óleo Motor 10W40")
        .barcode("7891234567890")
        .category(category)
        .costPrice(new BigDecimal("25.00"))
        .salePrice(new BigDecimal("45.00"))
        .stockQuantity(50)
        .minimumStock(10)
        .unit("UN")
        .active(true)
        .stockMovements(Collections.emptyList())
        .build();
    product.setId(1L);

    productRequest = new ProductRequest();
    productRequest.setName("Óleo Motor 10W40");
    productRequest.setBarcode("7891234567890");
    productRequest.setCategoryId(1L);
    productRequest.setCostPrice(new BigDecimal("25.00"));
    productRequest.setSalePrice(new BigDecimal("45.00"));
    productRequest.setStockQuantity(50);
    productRequest.setMinimumStock(10);
    productRequest.setUnit("UN");

    user = User.builder()
        .name("Admin")
        .email("admin@dvmotos.com.br")
        .build();
    user.setId(1L);
  }

  @Nested
  @DisplayName("create")
  class Create {

    @Test
    @DisplayName("deve criar produto com sucesso")
    void shouldCreateProductSuccessfully() {
      when(productRepository.existsByBarcode("7891234567890")).thenReturn(false);
      when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
      when(productRepository.save(any(Product.class))).thenReturn(product);

      ProductResponse result = productService.create(productRequest);

      assertThat(result.getName()).isEqualTo("Óleo Motor 10W40");
      assertThat(result.getCategoryName()).isEqualTo("Óleo e Lubrificantes");
      verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("deve criar produto sem categoria")
    void shouldCreateProductWithoutCategory() {
      productRequest.setCategoryId(null);
      Product productWithoutCategory = Product.builder()
          .name("Óleo Motor 10W40")
          .salePrice(new BigDecimal("45.00"))
          .stockQuantity(50)
          .build();
      productWithoutCategory.setId(1L);

      when(productRepository.existsByBarcode("7891234567890")).thenReturn(false);
      when(productRepository.save(any(Product.class))).thenReturn(productWithoutCategory);

      ProductResponse result = productService.create(productRequest);

      assertThat(result.getCategoryName()).isNull();
      verify(categoryRepository, never()).findById(any());
    }

    @Test
    @DisplayName("deve lançar exceção quando código de barras duplicado")
    void shouldThrowExceptionWhenBarcodeDuplicated() {
      when(productRepository.existsByBarcode("7891234567890")).thenReturn(true);

      assertThatThrownBy(() -> productService.create(productRequest))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("código de barras");

      verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve lançar exceção quando categoria não encontrada")
    void shouldThrowExceptionWhenCategoryNotFound() {
      when(productRepository.existsByBarcode("7891234567890")).thenReturn(false);
      when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> productService.create(productRequest))
          .isInstanceOf(ResourceNotFoundException.class);
    }
  }

  @Nested
  @DisplayName("findById")
  class FindById {

    @Test
    @DisplayName("deve retornar produto quando encontrado")
    void shouldReturnProductWhenFound() {
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));

      ProductResponse result = productService.findById(1L);

      assertThat(result.getId()).isEqualTo(1L);
      assertThat(result.getName()).isEqualTo("Óleo Motor 10W40");
    }

    @Test
    @DisplayName("deve lançar exceção quando não encontrado")
    void shouldThrowExceptionWhenNotFound() {
      when(productRepository.findById(99L)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> productService.findById(99L))
          .isInstanceOf(ResourceNotFoundException.class);
    }
  }

  @Nested
  @DisplayName("lowStock")
  class LowStock {

    @Test
    @DisplayName("deve identificar produto com estoque baixo")
    void shouldIdentifyLowStockProduct() {
      product.setStockQuantity(5);
      product.setMinimumStock(10);
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));

      ProductResponse result = productService.findById(1L);

      assertThat(result.getLowStock()).isTrue();
    }

    @Test
    @DisplayName("deve identificar produto com estoque ok")
    void shouldIdentifyOkStockProduct() {
      product.setStockQuantity(50);
      product.setMinimumStock(10);
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));

      ProductResponse result = productService.findById(1L);

      assertThat(result.getLowStock()).isFalse();
    }

    @Test
    @DisplayName("deve identificar estoque baixo quando igual ao mínimo")
    void shouldIdentifyLowStockWhenEqualToMinimum() {
      product.setStockQuantity(10);
      product.setMinimumStock(10);
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));

      ProductResponse result = productService.findById(1L);

      assertThat(result.getLowStock()).isTrue();
    }
  }

  @Nested
  @DisplayName("addStockMovement")
  class AddStockMovement {

    @Test
    @DisplayName("deve adicionar entrada de estoque")
    void shouldAddStockIn() {
      StockMovementRequest request = new StockMovementRequest();
      request.setType(MovementType.IN);
      request.setQuantity(20);
      request.setReason("Compra fornecedor");

      when(productRepository.findById(1L)).thenReturn(Optional.of(product));
      when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));
      when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(i -> {
        StockMovement mov = i.getArgument(0);
        mov.setId(1L);
        return mov;
      });

      StockMovementResponse result = productService.addStockMovement(1L, request, user);

      assertThat(result.getPreviousQuantity()).isEqualTo(50);
      assertThat(result.getNewQuantity()).isEqualTo(70);
      assertThat(result.getType()).isEqualTo(MovementType.IN);
    }

    @Test
    @DisplayName("deve adicionar saída de estoque")
    void shouldAddStockOut() {
      StockMovementRequest request = new StockMovementRequest();
      request.setType(MovementType.OUT);
      request.setQuantity(10);
      request.setReason("Venda");

      when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));
      when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));
      when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(i -> {
        StockMovement mov = i.getArgument(0);
        mov.setId(1L);
        return mov;
      });

      StockMovementResponse result = productService.addStockMovement(1L, request, user);

      assertThat(result.getPreviousQuantity()).isEqualTo(50);
      assertThat(result.getNewQuantity()).isEqualTo(40);
      assertThat(result.getType()).isEqualTo(MovementType.OUT);
    }

    @Test
    @DisplayName("deve lançar exceção quando saída maior que estoque")
    void shouldThrowExceptionWhenOutExceedsStock() {
      StockMovementRequest request = new StockMovementRequest();
      request.setType(MovementType.OUT);
      request.setQuantity(100);

      when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));

      assertThatThrownBy(() -> productService.addStockMovement(1L, request, user))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Estoque insuficiente");
    }

    @Test
    @DisplayName("deve fazer ajuste de estoque")
    void shouldAdjustStock() {
      StockMovementRequest request = new StockMovementRequest();
      request.setType(MovementType.ADJUSTMENT);
      request.setQuantity(30);
      request.setReason("Ajuste inventário");

      when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(product));
      when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));
      when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(i -> {
        StockMovement mov = i.getArgument(0);
        mov.setId(1L);
        return mov;
      });

      StockMovementResponse result = productService.addStockMovement(1L, request, user);

      assertThat(result.getPreviousQuantity()).isEqualTo(50);
      assertThat(result.getNewQuantity()).isEqualTo(30);
      assertThat(result.getType()).isEqualTo(MovementType.ADJUSTMENT);
    }
  }

  @Nested
  @DisplayName("toggleStatus")
  class ToggleStatus {

    @Test
    @DisplayName("deve desativar produto ativo")
    void shouldDeactivateActiveProduct() {
      product.setActive(true);
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));
      when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

      ProductResponse result = productService.toggleStatus(1L);

      assertThat(result.getActive()).isFalse();
    }

    @Test
    @DisplayName("deve ativar produto inativo")
    void shouldActivateInactiveProduct() {
      product.setActive(false);
      when(productRepository.findById(1L)).thenReturn(Optional.of(product));
      when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

      ProductResponse result = productService.toggleStatus(1L);

      assertThat(result.getActive()).isTrue();
    }
  }
}
