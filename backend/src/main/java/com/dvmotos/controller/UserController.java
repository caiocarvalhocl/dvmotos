package com.dvmotos.controller;

import com.dvmotos.dto.request.UserRequest;
import com.dvmotos.dto.response.UserResponse;
import com.dvmotos.entity.User;
import com.dvmotos.service.UserService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management")
public class UserController {
    private final UserService userService;

    // ============ MY PROFILE ENDPOINTS ============

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(UserResponse.fromEntity(currentUser));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(currentUser.getId(), request));
    }

    @PatchMapping("/me/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<Map<String, String>> changeMyPassword(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        userService.changeMyPassword(currentUser.getId(), request.get("currentPassword"), request.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ============ ADMIN ENDPOINTS ============

    @GetMapping
    @Operation(summary = "List users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> findAll(
            @PageableDefault(size = 20, sort = "name") Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.findAll(pageable, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find user by ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create new user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Reactivate user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activate(id));
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Change user password (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        userService.changePassword(id, request.get("password"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
