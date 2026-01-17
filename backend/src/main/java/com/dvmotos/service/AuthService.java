package com.dvmotos.service;

import com.dvmotos.dto.request.LoginRequest;
import com.dvmotos.dto.response.AuthResponse;
import com.dvmotos.dto.response.UserResponse;
import com.dvmotos.entity.User;
import com.dvmotos.repository.UserRepository;
import com.dvmotos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder()
                .token(token).refreshToken(refreshToken).type("Bearer")
                .expiresIn(jwtService.getJwtExpiration()).user(UserResponse.fromEntity(user)).build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (jwtService.isTokenValid(refreshToken, user)) {
            String newToken = jwtService.generateToken(user);
            return AuthResponse.builder()
                    .token(newToken).refreshToken(refreshToken).type("Bearer")
                    .expiresIn(jwtService.getJwtExpiration()).user(UserResponse.fromEntity(user)).build();
        }
        throw new RuntimeException("Invalid refresh token");
    }
}
