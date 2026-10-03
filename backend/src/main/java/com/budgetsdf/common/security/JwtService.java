package com.budgetsdf.common.security;

import com.budgetsdf.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Crea y valida tokens JWT firmados para autenticar las solicitudes de la API.
 */
@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    /**
     * Configura la clave de firma y el tiempo de vigencia desde la configuración de la aplicación.
     *
     * @param secret secreto usado para firmar los tokens
     * @param expirationMs duración del token en milisegundos
     */
    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Genera un JWT con el nombre de usuario, su rol y fechas de emisión y expiración.
     *
     * @param user usuario autenticado que será representado en el token
     * @return token firmado
     */
    public String generateToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * Extrae el sujeto del token después de verificar su firma.
     *
     * @param token JWT recibido
     * @return nombre de usuario guardado como sujeto
     */
    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Comprueba que el token firmado no haya expirado.
     *
     * @param token JWT recibido
     * @return {@code true} cuando la fecha de expiración es posterior al momento actual
     */
    public boolean isValid(String token) {
        return parseClaims(token).getExpiration().after(new Date());
    }

    /** Analiza el JWT y verifica su firma antes de exponer sus datos. */
    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
