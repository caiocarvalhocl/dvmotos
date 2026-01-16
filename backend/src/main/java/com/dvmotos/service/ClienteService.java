package com.dvmotos.service;

import com.dvmotos.dto.request.ClienteRequest;
import com.dvmotos.dto.response.ClienteResponse;
import com.dvmotos.entity.Cliente;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public Page<ClienteResponse> findAll(String search, Pageable pageable) {
        Page<Cliente> clientes;
        if (search != null && !search.trim().isEmpty()) {
            clientes = clienteRepository.search(search.trim(), pageable);
        } else {
            clientes = clienteRepository.findByAtivoTrue(pageable);
        }

        return clientes.map(ClienteResponse::fromEntity);
    }

    public ClienteResponse findById(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        return ClienteResponse.fromEntity(cliente);
    }

    @Transactional
    public ClienteResponse create(ClienteRequest request) {
        if (request.getCpfCnpj() != null && clienteRepository.existsByCpfCnpj(request.getCpfCnpj())) {
            throw new BusinessException("Já existe um cliente com este CPF/CNPJ");
        }

        Cliente cliente = Cliente.builder()
                .nome(request.getNome())
                .cpfCnpj(request.getCpfCnpj())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .endereco(request.getEndereco())
                .cidade(request.getCidade())
                .estado(request.getEstado())
                .cep(request.getCep())
                .observacoes(request.getObservacoes())
                .build();

        cliente = clienteRepository.save(cliente);
        return ClienteResponse.fromEntity(cliente);
    }

    @Transactional
    public ClienteResponse update(Long id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));

        if (request.getCpfCnpj() != null && !request.getCpfCnpj().equals(cliente.getCpfCnpj())) {
            if (clienteRepository.existsByCpfCnpj(request.getCpfCnpj())) {
                throw new BusinessException("Já existe um cliente com este CPF/CNPJ");
            }
        }

        cliente.setNome(request.getNome());
        cliente.setCpfCnpj(request.getCpfCnpj());
        cliente.setTelefone(request.getTelefone());
        cliente.setEmail(request.getEmail());
        cliente.setEndereco(request.getEndereco());
        cliente.setCidade(request.getCidade());
        cliente.setEstado(request.getEstado());
        cliente.setCep(request.getCep());
        cliente.setObservacoes(request.getObservacoes());

        cliente = clienteRepository.save(cliente);
        return ClienteResponse.fromEntity(cliente);
    }

    @Transactional
    public void delete(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));

        // Soft delete
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional
    public ClienteResponse activate(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        cliente.setAtivo(true);
        cliente = clienteRepository.save(cliente);
        return ClienteResponse.fromEntity(cliente);
    }
}
