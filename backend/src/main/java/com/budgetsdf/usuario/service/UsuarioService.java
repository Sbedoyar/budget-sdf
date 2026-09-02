package com.budgetsdf.usuario.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.common.security.JwtService;
import com.budgetsdf.usuario.dto.request.LoginRequest;
import com.budgetsdf.usuario.dto.response.LoginResponse;
import com.budgetsdf.usuario.entity.Usuario;
import com.budgetsdf.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long expirationMs;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.expirationMs = expirationMs;
    }

    public LoginResponse iniciarSesion(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Credenciales incorrectas"));
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BusinessException("Credenciales incorrectas");
        }
        return new LoginResponse(jwtService.generarToken(usuario), "Bearer", usuario.getUsername(),
                usuario.getRol(), expirationMs / 1000);
    }
}
