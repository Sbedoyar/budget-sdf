package com.budgetsdf.common.security;

import com.budgetsdf.common.exception.BusinessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifica credenciales de Google y extrae la identidad mínima necesaria para el acceso.
 */
@Service
public class GoogleTokenService {

    private final GoogleIdTokenVerifier verifier;

    /**
     * Construye el verificador limitado al identificador de cliente configurado.
     *
     * @param clientId identificador OAuth de la aplicación
     * @throws GeneralSecurityException si no se puede preparar el transporte seguro
     * @throws IOException si ocurre un error de entrada o salida durante la configuración
     */
    public GoogleTokenService(
            @Value("${app.google.client-id}") String clientId
    ) throws GeneralSecurityException, IOException {

        this.verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Valida la credencial, el correo verificado y la identidad entregada por Google.
     *
     * @param credential token de identidad recibido del cliente
     * @return identificador estable de Google y correo normalizado
     * @throws BusinessException si la credencial no es válida o no permite identificar al usuario
     */
    public GoogleUserInfo verify(String credential) {

        if (credential == null || credential.isBlank()) {
            throw new BusinessException(
                    "La credencial de Google es obligatoria"
            );
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new BusinessException(
                        "Token de Google inválido"
                );
            }

            // No se acepta una identidad de Google cuyo correo no haya sido verificado.
            GoogleIdToken.Payload payload = idToken.getPayload();

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new BusinessException(
                        "El correo de Google no está verificado"
                );
            }

            String subject = payload.getSubject();
            String email = payload.getEmail();

            if (subject == null || subject.isBlank()
                    || email == null || email.isBlank()) {
                throw new BusinessException(
                        "No fue posible obtener la identidad de Google"
                );
            }

            return new GoogleUserInfo(
                    subject,
                    email.trim().toLowerCase()
            );

        } catch (GeneralSecurityException | IOException exception) {
            throw new BusinessException(
                    "No fue posible validar el inicio de sesión con Google"
            );
        }
    }

    /** Datos de identidad verificados que consume el servicio de usuarios. */
    public record GoogleUserInfo(
            String subject,
            String email
    ) {
    }
}