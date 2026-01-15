package com.dvmotos.service;

import com.dvmotos.dto.request.LoginRequest;
import com.dvmotos.dto.response.AuthResponse;
import com.dvmotos.dto.response.UsuarioResponse;
import com.dvmotos.entity.Usuario;
import com.dvmotos.repository.UsuarioRepository;
import com.dvmotos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha()));

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String token = jwtService.generateToken(usuario);
        String refreshToken = jwtService.generateRefreshToken(usuario);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tipo("Bearer")
                .expiresIn(jwtService.getJwtExpiration())
                .usuario(UsuarioResponse.fromEntity(usuario))
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        if (jwtService.isTokenValid(refreshToken, usuario)) {
            String newToken = jwtService.generateToken(usuario);
            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(refreshToken)
                    .tipo("Bearer")
                    .expiresIn(jwtService.getJwtExpiration())
                    .usuario(UsuarioResponse.fromEntity(usuario))
                    .build();
        }

        throw new RuntimeException("Refresh token inválido");
    }
}
