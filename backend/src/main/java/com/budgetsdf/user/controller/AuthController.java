package com.budgetsdf.user.controller;

import com.budgetsdf.user.dto.request.GoogleLoginRequest;
import com.budgetsdf.user.dto.request.LoginRequest;
import com.budgetsdf.user.dto.response.LoginResponse;
import com.budgetsdf.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expone los endpoints públicos de inicio de sesión tradicional y con Google.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Autentica al usuario con nombre de usuario y contraseña.
     *
     * @param request credenciales recibidas y validadas desde el cuerpo HTTP
     * @return respuesta con el JWT y los datos básicos del usuario
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                userService.login(request)
        );
    }

    /**
     * Inicia sesión a partir de una credencial de identidad de Google.
     *
     * @param request credencial de Google recibida desde el cliente
     * @return respuesta con el JWT y los datos básicos del usuario
     */
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        return ResponseEntity.ok(
                userService.loginWithGoogle(request)
        );
    }
}