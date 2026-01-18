package com.dvmotos.dto.request;

import com.dvmotos.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    private Role role;
}
