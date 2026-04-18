package com.dvmotos.service;

import com.dvmotos.dto.request.ClientRequest;
import com.dvmotos.dto.response.ClientResponse;
import com.dvmotos.entity.Client;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public Page<ClientResponse> findAll(String search, Boolean active, Pageable pageable) {
        Page<Client> clients;

        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasSearch && active != null) {
            clients = clientRepository.searchWithStatus(search.trim(), active, pageable);
        } else if (hasSearch) {
            clients = clientRepository.searchAll(search.trim(), pageable);
        } else if (active != null) {
            clients = clientRepository.findByActive(active, pageable);
        } else {
            clients = clientRepository.findAll(pageable);
        }

        return clients.map(ClientResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(Long id) {
        return ClientResponse.fromEntity(clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id)));
    }

    @Transactional
    public ClientResponse create(ClientRequest request) {
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().isBlank()
                && clientRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new BusinessException("CPF já cadastrado em outro cliente");
        }
        Client client = Client.builder()
                .name(request.getName()).documentNumber(request.getDocumentNumber())
                .phone(request.getPhone()).email(request.getEmail())
                .address(request.getAddress()).city(request.getCity())
                .state(request.getState()).zipCode(request.getZipCode())
                .notes(request.getNotes()).build();
        return ClientResponse.fromEntity(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(Long id, ClientRequest request) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().isBlank()
                && !request.getDocumentNumber().equals(client.getDocumentNumber())) {
            if (clientRepository.existsByDocumentNumber(request.getDocumentNumber())) {
                throw new BusinessException("CPF já cadastrado em outro cliente");
            }
        }
        client.setName(request.getName());
        client.setDocumentNumber(request.getDocumentNumber());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setAddress(request.getAddress());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setZipCode(request.getZipCode());
        client.setNotes(request.getNotes());
        return ClientResponse.fromEntity(clientRepository.save(client));
    }

    @Transactional
    public void delete(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
        client.setActive(false);
        clientRepository.save(client);
    }

    @Transactional
    public ClientResponse activate(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
        client.setActive(true);
        return ClientResponse.fromEntity(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse toggleStatus(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
        client.setActive(!client.getActive());
        return ClientResponse.fromEntity(clientRepository.save(client));
    }

    @Transactional(readOnly = true)
    public long countActiveClients() {
        return clientRepository.countActiveClients();
    }
}
