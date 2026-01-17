package com.dvmotos.config;

import com.dvmotos.entity.Role;
import com.dvmotos.entity.User;
import com.dvmotos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "admin@dvmotos.com.br";
        String password = "admin123";
        User admin = userRepository.findByEmail(email)
                .orElse(User.builder().name("Administrator").email(email).role(Role.ADMIN).active(true).build());
        admin.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(admin);
        log.info("✅ Admin configured: {} / {}", email, password);
    }
}
