package com.dvmotos.service;

import com.dvmotos.dto.request.VeiculoRequest;
import com.dvmotos.dto.response.VeiculoResponse;
import com.dvmotos.entity.Cliente;
import com.dvmotos.entity.Veiculo;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.ClienteRepository;
import com.dvmotos.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public Page<VeiculoResponse> findAll(String search, Pageable pageable) {
        Page<Veiculo> veiculos;
        if (search != null && !search.trim().isEmpty()) {
            veiculos = veiculoRepository.search(search.trim(), pageable);
        } else {
            veiculos = veiculoRepository.findByAtivoTrue(pageable);
        }
        return veiculos.map(VeiculoResponse::fromEntity);
    }

    public VeiculoResponse findById(Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));
        return VeiculoResponse.fromEntity(veiculo);
    }

    public VeiculoResponse findByPlaca(String placa) {
        Veiculo veiculo = veiculoRepository.findByPlaca(placa.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado com placa: " + placa));
        return VeiculoResponse.fromEntity(veiculo);
    }

    public List<VeiculoResponse> findByCliente(Long clienteId) {
        return veiculoRepository.findByClienteIdAndAtivoTrue(clienteId)
                .stream()
                .map(VeiculoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VeiculoResponse create(VeiculoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", request.getClienteId()));

        String placaUpperCase = request.getPlaca().toUpperCase();
        if (veiculoRepository.existsByPlaca(placaUpperCase)) {
            throw new BusinessException("Já existe um veículo com esta placa");
        }

        if (request.getChassi() != null && veiculoRepository.existsByChassi(request.getChassi())) {
            throw new BusinessException("Já existe um veículo com este chassi");
        }

        Veiculo veiculo = Veiculo.builder()
                .cliente(cliente)
                .placa(placaUpperCase)
                .marca(request.getMarca())
                .modelo(request.getModelo())
                .ano(request.getAno())
                .cor(request.getCor())
                .chassi(request.getChassi())
                .kmAtual(request.getKmAtual())
                .observacoes(request.getObservacoes())
                .build();

        veiculo = veiculoRepository.save(veiculo);
        return VeiculoResponse.fromEntity(veiculo);
    }

    @Transactional
    public VeiculoResponse update(Long id, VeiculoRequest request) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", request.getClienteId()));

        String placaUpperCase = request.getPlaca().toUpperCase();
        if (!placaUpperCase.equals(veiculo.getPlaca()) && veiculoRepository.existsByPlaca(placaUpperCase)) {
            throw new BusinessException("Já existe um veículo com esta placa");
        }

        if (request.getChassi() != null && !request.getChassi().equals(veiculo.getChassi())) {
            if (veiculoRepository.existsByChassi(request.getChassi())) {
                throw new BusinessException("Já existe um veículo com este chassi");
            }
        }

        veiculo.setCliente(cliente);
        veiculo.setPlaca(placaUpperCase);
        veiculo.setMarca(request.getMarca());
        veiculo.setModelo(request.getModelo());
        veiculo.setAno(request.getAno());
        veiculo.setCor(request.getCor());
        veiculo.setChassi(request.getChassi());
        veiculo.setKmAtual(request.getKmAtual());
        veiculo.setObservacoes(request.getObservacoes());

        veiculo = veiculoRepository.save(veiculo);
        return VeiculoResponse.fromEntity(veiculo);
    }

    @Transactional
    public void delete(Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));

        // Soft delete
        veiculo.setAtivo(false);
        veiculoRepository.save(veiculo);
    }
}
