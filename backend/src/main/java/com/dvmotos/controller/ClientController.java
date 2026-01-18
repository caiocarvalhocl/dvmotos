package com.dvmotos.controller;

import com.dvmotos.dto.request.ClientRequest;
import com.dvmotos.dto.response.ClientResponse;
import com.dvmotos.service.ClientService;
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

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Clients", description = "Client management")
public class ClientController {
    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "List clients")
    public ResponseEntity<Page<ClientResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(clientService.findAll(search, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find client by ID")
    public ResponseEntity<ClientResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create client")
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update client")
    public ResponseEntity<ClientResponse> update(@PathVariable Long id, @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate client")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Reactivate client")
    public ResponseEntity<ClientResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.activate(id));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle client active status")
    public ResponseEntity<ClientResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.toggleStatus(id));
    }
}
