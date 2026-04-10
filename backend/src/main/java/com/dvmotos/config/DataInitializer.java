package com.dvmotos.config;

import com.dvmotos.entity.Role;
import com.dvmotos.entity.User;
import com.dvmotos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@dvmotos.com.br}")
    private String adminEmail;

    @Value("${admin.password:#{null}}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Admin user already exists, skipping initialization");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn(
                    "ADMIN_PASSWORD not set. Skipping admin user creation. Set ADMIN_PASSWORD env var to create the initial admin.");
            return;
        }

        User admin = User.builder()
                .name("Administrador")
                .email(adminEmail)
                .role(Role.ADMIN)
                .active(true)
                .build();
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
        log.info("Admin user created: {}", adminEmail);
    }
}
