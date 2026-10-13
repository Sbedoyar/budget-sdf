package com.budgetsdf.user.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.user.dto.request.GoogleLoginRequest;
import com.budgetsdf.user.dto.request.LoginRequest;
import com.budgetsdf.user.dto.response.LoginResponse;

/** Contrato de las operaciones del servicio de usuarios. */
public interface UserService {

    /**
     * Autentica con nombre de usuario y contraseña y emite un token JWT.
     *
     * @param request credenciales tradicionales del usuario
     * @return token y datos básicos de la sesión autenticada
     * @throws BusinessException si el usuario o la contraseña no son válidos
     */
    LoginResponse login(LoginRequest request);

    /**
     * Verifica la credencial de Google y asocia su identidad con una cuenta autorizada.
     *
     * @param request credencial de identidad emitida por Google
     * @return token y datos básicos de la sesión autenticada
     * @throws BusinessException si Google no valida la identidad o la cuenta no está autorizada
     */
    LoginResponse loginWithGoogle(GoogleLoginRequest request);
}
