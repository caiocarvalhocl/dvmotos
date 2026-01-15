package com.dvmotos.controller;

import com.dvmotos.dto.request.VeiculoRequest;
import com.dvmotos.dto.response.VeiculoResponse;
import com.dvmotos.service.VeiculoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/veiculos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Veículos", description = "Gerenciamento de veículos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    @GetMapping
    @Operation(summary = "Listar veículos", description = "Lista todos os veículos com paginação e busca")
    public ResponseEntity<Page<VeiculoResponse>> findAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "placa", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(veiculoService.findAll(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar veículo por ID")
    public ResponseEntity<VeiculoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.findById(id));
    }

    @GetMapping("/placa/{placa}")
    @Operation(summary = "Buscar veículo por placa")
    public ResponseEntity<VeiculoResponse> findByPlaca(@PathVariable String placa) {
        return ResponseEntity.ok(veiculoService.findByPlaca(placa));
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Listar veículos de um cliente")
    public ResponseEntity<List<VeiculoResponse>> findByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(veiculoService.findByCliente(clienteId));
    }

    @PostMapping
    @Operation(summary = "Cadastrar veículo")
    public ResponseEntity<VeiculoResponse> create(@Valid @RequestBody VeiculoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar veículo")
    public ResponseEntity<VeiculoResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody VeiculoRequest request
    ) {
        return ResponseEntity.ok(veiculoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar veículo")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veiculoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
