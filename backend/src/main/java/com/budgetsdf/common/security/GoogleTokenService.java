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

@Service
public class GoogleTokenService {

    private final GoogleIdTokenVerifier verifier;

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

    public record GoogleUserInfo(
            String subject,
            String email
    ) {
    }
}