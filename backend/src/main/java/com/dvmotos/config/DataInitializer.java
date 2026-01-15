package com.dvmotos.config;

import com.dvmotos.entity.Role;
import com.dvmotos.entity.Usuario;
import com.dvmotos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final UsuarioRepository usuarioRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                String email = "admin@dvmotos.com.br";
                String senha = "admin123";

                Usuario admin = usuarioRepository.findByEmail(email)
                                .orElse(Usuario.builder()
                                                .nome("Administrador")
                                                .email(email)
                                                .role(Role.ADMIN)
                                                .ativo(true)
                                                .build());

                // Sempre atualiza a senha para garantir que está correta
                admin.setSenhaHash(passwordEncoder.encode(senha));
                usuarioRepository.save(admin);

                log.info("✅ Admin configurado: {} / {}", email, senha);
        }
}
