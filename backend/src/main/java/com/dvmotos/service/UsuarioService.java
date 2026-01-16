package com.dvmotos.service;

import com.dvmotos.dto.request.UsuarioRequest;
import com.dvmotos.dto.response.UsuarioResponse;
import com.dvmotos.entity.Role;
import com.dvmotos.entity.Usuario;
import com.dvmotos.exception.BusinessException;
import com.dvmotos.exception.ResourceNotFoundException;
import com.dvmotos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UsuarioResponse> findAll(Pageable pageable, String search) {
        Page<Usuario> usuarios;
        
        if (search != null && !search.isBlank()) {
            usuarios = usuarioRepository.search(search, pageable);
        } else {
            usuarios = usuarioRepository.findAll(pageable);
        }
        
        return usuarios.map(UsuarioResponse::fromEntity);
    }

    public UsuarioResponse findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return UsuarioResponse.fromEntity(usuario);
    }

    @Transactional
    public UsuarioResponse create(UsuarioRequest request) {
        // Verificar se e-mail já existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("E-mail já cadastrado");
        }

        // Validar senha obrigatória na criação
        if (request.getSenha() == null || request.getSenha().isBlank()) {
            throw new BusinessException("Senha é obrigatória");
        }

        Usuario usuario = Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail().toLowerCase().trim())
                .senhaHash(passwordEncoder.encode(request.getSenha()))
                .role(request.getRole() != null ? request.getRole() : Role.OPERADOR)
                .ativo(true)
                .build();

        usuario = usuarioRepository.save(usuario);
        return UsuarioResponse.fromEntity(usuario);
    }

    @Transactional
    public UsuarioResponse update(Long id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Verificar se e-mail já existe (outro usuário)
        if (!usuario.getEmail().equalsIgnoreCase(request.getEmail()) 
                && usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("E-mail já cadastrado para outro usuário");
        }

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail().toLowerCase().trim());
        
        // Atualizar role se informado
        if (request.getRole() != null) {
            usuario.setRole(request.getRole());
        }

        // Atualizar senha apenas se informada
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(request.getSenha()));
        }

        usuario = usuarioRepository.save(usuario);
        return UsuarioResponse.fromEntity(usuario);
    }

    @Transactional
    public void delete(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        // Soft delete
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public UsuarioResponse activate(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        usuario.setAtivo(true);
        usuario = usuarioRepository.save(usuario);
        return UsuarioResponse.fromEntity(usuario);
    }

    @Transactional
    public void changePassword(Long id, String novaSenha) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        if (novaSenha == null || novaSenha.length() < 6) {
            throw new BusinessException("Senha deve ter no mínimo 6 caracteres");
        }
        
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
}
