package com.dvmotos.controller;

import com.dvmotos.dto.request.CategoryRequest;
import com.dvmotos.entity.Category;
import com.dvmotos.entity.Role;
import com.dvmotos.entity.User;
import com.dvmotos.repository.CategoryRepository;
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
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String token;
    private Category category;

    @BeforeEach
    void setUp() {
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
                .name("Óleo e Lubrificantes")
                .description("Óleos de motor")
                .active(true)
                .build();
        categoryRepository.save(category);
    }

    @Test
    @Order(1)
    @DisplayName("GET /categories - deve listar categorias")
    void shouldListCategories() throws Exception {
        mockMvc.perform(get("/categories")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Óleo e Lubrificantes")));
    }

    @Test
    @Order(2)
    @DisplayName("GET /categories - deve filtrar por status ativo")
    void shouldFilterByActiveStatus() throws Exception {
        Category inactive = Category.builder()
                .name("Inativa")
                .active(false)
                .build();
        categoryRepository.save(inactive);

        mockMvc.perform(get("/categories")
                .param("active", "true")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Óleo e Lubrificantes")));
    }

    @Test
    @Order(3)
    @DisplayName("GET /categories/{id} - deve retornar categoria por ID")
    void shouldReturnCategoryById() throws Exception {
        mockMvc.perform(get("/categories/" + category.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Óleo e Lubrificantes")));
    }

    @Test
    @Order(4)
    @DisplayName("GET /categories/{id} - deve retornar 404 quando não encontrado")
    void shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/categories/99999")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(5)
    @DisplayName("POST /categories - deve criar categoria")
    void shouldCreateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Filtros");
        request.setDescription("Filtros diversos");

        mockMvc.perform(post("/categories")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Filtros")))
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @Order(6)
    @DisplayName("POST /categories - deve retornar erro quando nome duplicado")
    void shouldReturnErrorWhenNameDuplicated() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Óleo e Lubrificantes");

        mockMvc.perform(post("/categories")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(7)
    @DisplayName("PUT /categories/{id} - deve atualizar categoria")
    void shouldUpdateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Óleo Atualizado");
        request.setDescription("Descrição atualizada");

        mockMvc.perform(put("/categories/" + category.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Óleo Atualizado")));
    }

    @Test
    @Order(8)
    @DisplayName("PATCH /categories/{id}/toggle-status - deve alternar status")
    void shouldToggleStatus() throws Exception {
        mockMvc.perform(patch("/categories/" + category.getId() + "/toggle-status")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));
    }

    @Test
    @Order(9)
    @DisplayName("deve retornar 401 sem token")
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isForbidden());
    }
}
