package com.dvmotos.controller;

import com.dvmotos.dto.request.UsuarioRequest;
import com.dvmotos.dto.response.UsuarioResponse;
import com.dvmotos.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gerenciamento de usuarios do sistema")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Lista todos os usuarios com paginacao e busca")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UsuarioResponse>> findAll(
            @PageableDefault(size = 20, sort = "nome") Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(usuarioService.findAll(pageable, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuario por ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar novo usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> create(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request
    ) {
        return ResponseEntity.ok(usuarioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Reativar usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.activate(id));
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Alterar senha do usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String novaSenha = request.get("senha");
        usuarioService.changePassword(id, novaSenha);
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
    }
}
