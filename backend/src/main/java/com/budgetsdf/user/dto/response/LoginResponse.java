package com.budgetsdf.user.dto.response;

import com.budgetsdf.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Resultado del inicio de sesión con el JWT, el usuario, su rol y el tiempo de vigencia.
 */
@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type;
    private String username;
    private UserRole role;
    private long expiresIn;
}
