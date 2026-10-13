package com.budgetsdf.user.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.common.security.GoogleTokenService;
import com.budgetsdf.common.security.JwtService;
import com.budgetsdf.user.dto.request.GoogleLoginRequest;
import com.budgetsdf.user.dto.request.LoginRequest;
import com.budgetsdf.user.dto.response.LoginResponse;
import com.budgetsdf.user.entity.User;
import com.budgetsdf.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Valida las credenciales de acceso y genera respuestas de autenticación para los usuarios.
 */
@Service("userService")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenService googleTokenService;
    private final long expirationMs;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleTokenService googleTokenService,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenService = googleTokenService;
        this.expirationMs = expirationMs;
    }

    /**
     * Autentica con nombre de usuario y contraseña y emite un token JWT.
     *
     * @param request credenciales tradicionales del usuario
     * @return token y datos básicos de la sesión autenticada
     * @throws BusinessException si el usuario o la contraseña no son válidos
     */
    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BusinessException(
                                "Credenciales incorrectas"
                        )
                );

        validatePassword(request, user);
        return createLoginResponse(user);
    }

    /**
     * Verifica la credencial de Google y asocia su identidad con una cuenta autorizada.
     *
     * @param request credencial de identidad emitida por Google
     * @return token y datos básicos de la sesión autenticada
     * @throws BusinessException si Google no valida la identidad o la cuenta no está autorizada
     */
    @Transactional
    @Override
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenService.GoogleUserInfo googleUser =
                googleTokenService.verify(request.getCredential());

        User user = findOrLinkGoogleUser(googleUser);
        return createLoginResponse(user);
    }

    private void validatePassword(LoginRequest request, User user) {
        // La contraseña recibida se compara con el hash almacenado, nunca en texto plano.
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(
                    "Credenciales incorrectas"
            );
        }
    }

    private User findOrLinkGoogleUser(
            GoogleTokenService.GoogleUserInfo googleUser
    ) {
        // Primero se busca el identificador estable de Google para reconocer cuentas vinculadas.
        User user = userRepository
                .findByGoogleSubject(googleUser.subject())
                .orElse(null);

        if (user != null) {
            return user;
        }

        return linkGoogleUser(googleUser);
    }

    private User linkGoogleUser(
            GoogleTokenService.GoogleUserInfo googleUser
    ) {
        // Solo se vincula Google a una cuenta local previamente autorizada por correo.
        User user = userRepository
                .findByEmail(googleUser.email())
                .orElseThrow(() ->
                        new BusinessException(
                                "La cuenta de Google no está autorizada"
                        )
                );

        validateGoogleSubject(user, googleUser.subject());

        user.setGoogleSubject(googleUser.subject());
        return userRepository.save(user);
    }

    private void validateGoogleSubject(User user, String googleSubject) {
        boolean hasDifferentGoogleSubject =
                user.getGoogleSubject() != null
                        && !user.getGoogleSubject().isBlank()
                        && !user.getGoogleSubject().equals(googleSubject);

        if (hasDifferentGoogleSubject) {
            throw new BusinessException(
                    "La cuenta de Google no coincide con el usuario registrado"
            );
        }
    }

    /**
     * Construye la respuesta común para ambos métodos de autenticación.
     *
     * @param user usuario autenticado
     * @return JWT firmado, tipo de token, rol y vigencia en segundos
     */
    private LoginResponse createLoginResponse(User user) {
        return new LoginResponse(
                jwtService.generateToken(user),
                "Bearer",
                user.getUsername(),
                user.getRole(),
                expirationMs / 1000
        );
    }
}
