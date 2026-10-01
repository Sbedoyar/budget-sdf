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

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenService googleTokenService;
    private final long expirationMs;

    public UserService(
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

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BusinessException(
                                "Credenciales incorrectas"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new BusinessException(
                    "Credenciales incorrectas"
            );
        }

        return createLoginResponse(user);
    }

    @Transactional
    public LoginResponse loginWithGoogle(
            GoogleLoginRequest request
    ) {

        GoogleTokenService.GoogleUserInfo googleUser =
                googleTokenService.verify(
                        request.getCredential()
                );

        User user = userRepository
                .findByGoogleSubject(googleUser.subject())
                .orElse(null);

        if (user == null) {

            user = userRepository
                    .findByEmail(googleUser.email())
                    .orElseThrow(() ->
                            new BusinessException(
                                    "La cuenta de Google no está autorizada"
                            )
                    );

            if (user.getGoogleSubject() != null
                    && !user.getGoogleSubject().isBlank()
                    && !user.getGoogleSubject()
                    .equals(googleUser.subject())) {

                throw new BusinessException(
                        "La cuenta de Google no coincide con el usuario registrado"
                );
            }

            user.setGoogleSubject(
                    googleUser.subject()
            );

            userRepository.save(user);
        }

        return createLoginResponse(user);
    }

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