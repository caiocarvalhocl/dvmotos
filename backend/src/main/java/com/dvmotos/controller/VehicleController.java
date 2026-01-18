package com.dvmotos.controller;

import com.dvmotos.dto.request.VehicleRequest;
import com.dvmotos.dto.response.VehicleResponse;
import com.dvmotos.service.VehicleService;
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
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Vehicles", description = "Vehicle management")
public class VehicleController {
    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "List vehicles")
    public ResponseEntity<Page<VehicleResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "licensePlate", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(vehicleService.findAll(search, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find vehicle by ID")
    public ResponseEntity<VehicleResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @GetMapping("/license-plate/{licensePlate}")
    @Operation(summary = "Find vehicle by license plate")
    public ResponseEntity<VehicleResponse> findByLicensePlate(@PathVariable String licensePlate) {
        return ResponseEntity.ok(vehicleService.findByLicensePlate(licensePlate));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "List vehicles by client")
    public ResponseEntity<List<VehicleResponse>> findByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(vehicleService.findByClient(clientId));
    }

    @PostMapping
    @Operation(summary = "Create vehicle")
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle")
    public ResponseEntity<VehicleResponse> update(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate vehicle")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle vehicle active status")
    public ResponseEntity<VehicleResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.toggleStatus(id));
    }
}
