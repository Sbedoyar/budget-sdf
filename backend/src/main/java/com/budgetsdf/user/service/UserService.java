package com.budgetsdf.user.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.common.security.JwtService;
import com.budgetsdf.user.dto.request.LoginRequest;
import com.budgetsdf.user.dto.response.LoginResponse;
import com.budgetsdf.user.entity.User;
import com.budgetsdf.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long expirationMs;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.expirationMs = expirationMs;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Credenciales incorrectas"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("Credenciales incorrectas");
        }
        return new LoginResponse(jwtService.generateToken(user), "Bearer", user.getUsername(),
                user.getRole(), expirationMs / 1000);
    }
}
