package com.dvmotos.service;

import com.dvmotos.dto.request.ClientRequest;
import com.dvmotos.dto.response.ClientResponse;
import com.dvmotos.entity.Client;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.ClientRepository;
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
class ClientServiceTest {

  @Mock
  private ClientRepository clientRepository;

  @InjectMocks
  private ClientService clientService;

  private Client client;
  private ClientRequest clientRequest;
  private Pageable pageable;

  @BeforeEach
  void setUp() {
    client = Client.builder()
        .name("João da Silva")
        .documentNumber("123.456.789-00")
        .phone("(11) 99999-9999")
        .email("joao@email.com")
        .city("São Paulo")
        .state("SP")
        .active(true)
        .vehicles(Collections.emptyList())
        .build();
    client.setId(1L);

    clientRequest = new ClientRequest();
    clientRequest.setName("João da Silva");
    clientRequest.setDocumentNumber("123.456.789-00");
    clientRequest.setPhone("(11) 99999-9999");
    clientRequest.setEmail("joao@email.com");
    clientRequest.setCity("São Paulo");
    clientRequest.setState("SP");

    pageable = PageRequest.of(0, 20);
  }

  @Nested
  @DisplayName("findAll")
  class FindAll {

    @Test
    @DisplayName("deve retornar todos os clientes")
    void shouldReturnAllClients() {
      Page<Client> page = new PageImpl<>(List.of(client));
      when(clientRepository.findAll(pageable)).thenReturn(page);

      Page<ClientResponse> result = clientService.findAll(null, null, pageable);

      assertThat(result.getContent()).hasSize(1);
      assertThat(result.getContent().get(0).getName()).isEqualTo("João da Silva");
    }

    @Test
    @DisplayName("deve filtrar por status ativo")
    void shouldFilterByActiveStatus() {
      Page<Client> page = new PageImpl<>(List.of(client));
      when(clientRepository.findByActive(true, pageable)).thenReturn(page);

      Page<ClientResponse> result = clientService.findAll(null, true, pageable);

      assertThat(result.getContent()).hasSize(1);
      verify(clientRepository).findByActive(true, pageable);
    }

    @Test
    @DisplayName("deve buscar por termo")
    void shouldSearchByTerm() {
      Page<Client> page = new PageImpl<>(List.of(client));
      when(clientRepository.searchAll("João", pageable)).thenReturn(page);

      Page<ClientResponse> result = clientService.findAll("João", null, pageable);

      assertThat(result.getContent()).hasSize(1);
      verify(clientRepository).searchAll("João", pageable);
    }
  }

  @Nested
  @DisplayName("create")
  class Create {

    @Test
    @DisplayName("deve criar cliente com sucesso")
    void shouldCreateClientSuccessfully() {
      when(clientRepository.existsByDocumentNumber("123.456.789-00")).thenReturn(false);
      when(clientRepository.save(any(Client.class))).thenReturn(client);

      ClientResponse result = clientService.create(clientRequest);

      assertThat(result.getName()).isEqualTo("João da Silva");
      verify(clientRepository).save(any(Client.class));
    }

    @Test
    @DisplayName("deve criar cliente sem documento")
    void shouldCreateClientWithoutDocument() {
      clientRequest.setDocumentNumber(null);
      when(clientRepository.save(any(Client.class))).thenReturn(client);

      ClientResponse result = clientService.create(clientRequest);

      assertThat(result.getName()).isEqualTo("João da Silva");
      verify(clientRepository, never()).existsByDocumentNumber(any());
    }

    @Test
    @DisplayName("deve lançar exceção quando documento duplicado")
    void shouldThrowExceptionWhenDocumentDuplicated() {
      when(clientRepository.existsByDocumentNumber("123.456.789-00")).thenReturn(true);

      assertThatThrownBy(() -> clientService.create(clientRequest))
          .isInstanceOf(BusinessException.class);

      verify(clientRepository, never()).save(any());
    }
  }

  @Nested
  @DisplayName("update")
  class Update {

    @Test
    @DisplayName("deve atualizar cliente com sucesso")
    void shouldUpdateClientSuccessfully() {
      when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
      when(clientRepository.save(any(Client.class))).thenReturn(client);

      clientRequest.setName("João da Silva Atualizado");
      ClientResponse result = clientService.update(1L, clientRequest);

      assertThat(result).isNotNull();
      verify(clientRepository).save(any(Client.class));
    }

    @Test
    @DisplayName("deve lançar exceção quando cliente não encontrado")
    void shouldThrowExceptionWhenClientNotFound() {
      when(clientRepository.findById(99L)).thenReturn(Optional.empty());

      assertThatThrownBy(() -> clientService.update(99L, clientRequest))
          .isInstanceOf(ResourceNotFoundException.class);
    }
  }

  @Nested
  @DisplayName("toggleStatus")
  class ToggleStatus {

    @Test
    @DisplayName("deve desativar cliente ativo")
    void shouldDeactivateActiveClient() {
      client.setActive(true);
      when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
      when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));

      ClientResponse result = clientService.toggleStatus(1L);

      assertThat(result.getActive()).isFalse();
    }

    @Test
    @DisplayName("deve ativar cliente inativo")
    void shouldActivateInactiveClient() {
      client.setActive(false);
      when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
      when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));

      ClientResponse result = clientService.toggleStatus(1L);

      assertThat(result.getActive()).isTrue();
    }
  }
}
