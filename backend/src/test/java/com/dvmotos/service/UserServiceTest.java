package com.dvmotos.service;

import com.dvmotos.dto.request.UserRequest;
import com.dvmotos.dto.response.UserResponse;
import com.dvmotos.entity.Role;
import com.dvmotos.entity.User;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  private User user;
  private UserRequest userRequest;

  @BeforeEach
  void setUp() {
    user = User.builder()
        .name("Admin")
        .email("admin@dvmotos.com.br")
        .passwordHash("hashedPassword")
        .role(Role.ADMIN)
        .active(true)
        .build();
    user.setId(1L);

    userRequest = new UserRequest();
    userRequest.setName("Admin");
    userRequest.setEmail("admin@dvmotos.com.br");
    userRequest.setPassword("admin123");
    userRequest.setRole(Role.ADMIN);
  }

  @Nested
  @DisplayName("create")
  class Create {

    @Test
    @DisplayName("deve criar usuário com sucesso")
    void shouldCreateUserSuccessfully() {
      when(userRepository.existsByEmail("admin@dvmotos.com.br")).thenReturn(false);
      when(passwordEncoder.encode("admin123")).thenReturn("hashedPassword");
      when(userRepository.save(any(User.class))).thenReturn(user);

      UserResponse result = userService.create(userRequest);

      assertThat(result.getName()).isEqualTo("Admin");
      assertThat(result.getEmail()).isEqualTo("admin@dvmotos.com.br");
      assertThat(result.getRole()).isEqualTo(Role.ADMIN);
      verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando email duplicado")
    void shouldThrowExceptionWhenEmailDuplicated() {
      when(userRepository.existsByEmail("admin@dvmotos.com.br")).thenReturn(true);

      assertThatThrownBy(() -> userService.create(userRequest))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Email already registered");

      verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve lançar exceção quando senha não informada")
    void shouldThrowExceptionWhenPasswordNotProvided() {
      userRequest.setPassword(null);
      when(userRepository.existsByEmail("admin@dvmotos.com.br")).thenReturn(false);

      assertThatThrownBy(() -> userService.create(userRequest))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Password is required");
    }

    @Test
    @DisplayName("deve usar role OPERADOR como padrão")
    void shouldUseOperadorAsDefaultRole() {
      userRequest.setRole(null);
      when(userRepository.existsByEmail("admin@dvmotos.com.br")).thenReturn(false);
      when(passwordEncoder.encode("admin123")).thenReturn("hashedPassword");
      when(userRepository.save(any(User.class))).thenAnswer(i -> {
        User u = i.getArgument(0);
        u.setId(1L);
        return u;
      });

      UserResponse result = userService.create(userRequest);

      assertThat(result.getRole()).isEqualTo(Role.OPERADOR);
    }
  }

  @Nested
  @DisplayName("changeMyPassword")
  class ChangeMyPassword {

    @Test
    @DisplayName("deve alterar senha com sucesso")
    void shouldChangePasswordSuccessfully() {
      when(userRepository.findById(1L)).thenReturn(Optional.of(user));
      when(passwordEncoder.matches("senhaAtual", "hashedPassword")).thenReturn(true);
      when(passwordEncoder.encode("novaSenha")).thenReturn("newHashedPassword");

      userService.changeMyPassword(1L, "senhaAtual", "novaSenha");

      verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando senha atual incorreta")
    void shouldThrowExceptionWhenCurrentPasswordIncorrect() {
      when(userRepository.findById(1L)).thenReturn(Optional.of(user));
      when(passwordEncoder.matches("senhaErrada", "hashedPassword")).thenReturn(false);

      assertThatThrownBy(() -> userService.changeMyPassword(1L, "senhaErrada", "novaSenha"))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("Current password is incorrect");

      verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve lançar exceção quando nova senha muito curta")
    void shouldThrowExceptionWhenNewPasswordTooShort() {
      when(userRepository.findById(1L)).thenReturn(Optional.of(user));
      when(passwordEncoder.matches("senhaAtual", "hashedPassword")).thenReturn(true);

      assertThatThrownBy(() -> userService.changeMyPassword(1L, "senhaAtual", "123"))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("at least 6 characters");
    }
  }

  @Nested
  @DisplayName("toggleStatus")
  class ToggleStatus {

    @Test
    @DisplayName("deve desativar usuário ativo")
    void shouldDeactivateActiveUser() {
      user.setActive(true);
      when(userRepository.findById(1L)).thenReturn(Optional.of(user));
      when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

      UserResponse result = userService.toggleStatus(1L);

      assertThat(result.getActive()).isFalse();
    }

    @Test
    @DisplayName("deve ativar usuário inativo")
    void shouldActivateInactiveUser() {
      user.setActive(false);
      when(userRepository.findById(1L)).thenReturn(Optional.of(user));
      when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

      UserResponse result = userService.toggleStatus(1L);

      assertThat(result.getActive()).isTrue();
    }
  }
}
