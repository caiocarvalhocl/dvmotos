package com.dvmotos.controller;

import com.dvmotos.dto.request.ProductRequest;
import com.dvmotos.dto.request.StockMovementRequest;
import com.dvmotos.entity.*;
import com.dvmotos.repository.CategoryRepository;
import com.dvmotos.repository.ProductRepository;
import com.dvmotos.repository.StockMovementRepository;
import com.dvmotos.repository.UserRepository;
import com.dvmotos.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String token;
    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        stockMovementRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .name("Admin")
                .email("admin@test.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(user);

        token = jwtService.generateToken(user);

        category = Category.builder()
                .name("Óleo")
                .active(true)
                .build();
        categoryRepository.save(category);

        product = Product.builder()
                .name("Óleo 10W40")
                .barcode("7891234567890")
                .category(category)
                .costPrice(new BigDecimal("25.00"))
                .salePrice(new BigDecimal("45.00"))
                .stockQuantity(50)
                .minimumStock(10)
                .unit("UN")
                .active(true)
                .build();
        productRepository.save(product);
    }

    @Test
    @Order(1)
    @DisplayName("GET /products - deve listar produtos")
    void shouldListProducts() throws Exception {
        mockMvc.perform(get("/products")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Óleo 10W40")));
    }

    @Test
    @Order(2)
    @DisplayName("GET /products - deve filtrar por busca")
    void shouldFilterBySearch() throws Exception {
        mockMvc.perform(get("/products")
                .param("search", "10W40")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));
    }

    @Test
    @Order(3)
    @DisplayName("GET /products/{id} - deve retornar produto")
    void shouldReturnProductById() throws Exception {
        mockMvc.perform(get("/products/" + product.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Óleo 10W40")))
                .andExpect(jsonPath("$.categoryName", is("Óleo")))
                .andExpect(jsonPath("$.lowStock", is(false)));
    }

    @Test
    @Order(4)
    @DisplayName("GET /products/barcode/{barcode} - deve buscar por código de barras")
    void shouldFindByBarcode() throws Exception {
        mockMvc.perform(get("/products/barcode/7891234567890")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Óleo 10W40")));
    }

    @Test
    @Order(5)
    @DisplayName("GET /products/low-stock - deve listar produtos com estoque baixo")
    void shouldListLowStockProducts() throws Exception {
        Product lowStock = Product.builder()
                .name("Produto Baixo")
                .salePrice(new BigDecimal("10.00"))
                .stockQuantity(2)
                .minimumStock(5)
                .unit("UN")
                .active(true)
                .build();
        productRepository.save(lowStock);

        mockMvc.perform(get("/products/low-stock")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Produto Baixo")));
    }

    @Test
    @Order(6)
    @DisplayName("POST /products - deve criar produto")
    void shouldCreateProduct() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Filtro de Óleo");
        request.setBarcode("7891234567891");
        request.setCategoryId(category.getId());
        request.setSalePrice(new BigDecimal("35.00"));
        request.setStockQuantity(30);
        request.setMinimumStock(5);

        mockMvc.perform(post("/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Filtro de Óleo")))
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @Order(7)
    @DisplayName("POST /products - deve retornar erro quando código de barras duplicado")
    void shouldReturnErrorWhenBarcodeDuplicated() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Outro Produto");
        request.setBarcode("7891234567890"); // Duplicado
        request.setSalePrice(new BigDecimal("10.00"));
        request.setStockQuantity(10);

        mockMvc.perform(post("/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(8)
    @DisplayName("POST /products/{id}/stock - deve registrar entrada de estoque")
    void shouldAddStockIn() throws Exception {
        StockMovementRequest request = new StockMovementRequest();
        request.setType(MovementType.IN);
        request.setQuantity(20);
        request.setReason("Compra fornecedor");

        mockMvc.perform(post("/products/" + product.getId() + "/stock")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.previousQuantity", is(50)))
                .andExpect(jsonPath("$.newQuantity", is(70)))
                .andExpect(jsonPath("$.type", is("IN")));
    }

    @Test
    @Order(9)
    @DisplayName("POST /products/{id}/stock - deve registrar saída de estoque")
    void shouldAddStockOut() throws Exception {
        StockMovementRequest request = new StockMovementRequest();
        request.setType(MovementType.OUT);
        request.setQuantity(10);
        request.setReason("Venda");

        mockMvc.perform(post("/products/" + product.getId() + "/stock")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.previousQuantity", is(50)))
                .andExpect(jsonPath("$.newQuantity", is(40)));
    }

    @Test
    @Order(10)
    @DisplayName("POST /products/{id}/stock - deve retornar erro quando saída maior que estoque")
    void shouldReturnErrorWhenOutExceedsStock() throws Exception {
        StockMovementRequest request = new StockMovementRequest();
        request.setType(MovementType.OUT);
        request.setQuantity(100);

        mockMvc.perform(post("/products/" + product.getId() + "/stock")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(11)
    @DisplayName("PATCH /products/{id}/toggle-status - deve alternar status")
    void shouldToggleStatus() throws Exception {
        mockMvc.perform(patch("/products/" + product.getId() + "/toggle-status")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));
    }
}
