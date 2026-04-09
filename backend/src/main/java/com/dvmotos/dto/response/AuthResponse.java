package com.dvmotos.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String type;
    private Long expiresIn;
    private UserResponse user;
}
