package com.budgetsdf.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Credencial de identidad de Google enviada al backend para validar el inicio de sesión.
 */
@Getter
@Setter
public class GoogleLoginRequest {

    @NotBlank(message = "La credencial de Google es obligatoria")
    private String credential;
}