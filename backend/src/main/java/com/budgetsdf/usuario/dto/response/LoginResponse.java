package com.budgetsdf.usuario.dto.response;

import com.budgetsdf.usuario.entity.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tipo;
    private String username;
    private RolUsuario rol;
    private long expiresIn;
}
