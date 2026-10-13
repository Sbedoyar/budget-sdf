package com.budgetsdf.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Configura autenticación sin sesión, autorización HTTP, manejo de errores y CORS.
 */
@Configuration
public class SecurityConfig {

    /** Proporciona BCrypt para codificar y comparar contraseñas. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Define las reglas de seguridad de la API y agrega el filtro JWT antes de la autenticación estándar.
     *
     * @param http configuración HTTP de Spring Security
     * @param jwtFilter filtro que autentica solicitudes con tokens Bearer
     * @return cadena de filtros configurada para la aplicación
     * @throws Exception si Spring no puede construir la cadena de seguridad
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter
    ) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(this::handleUnauthorized)
                        .accessDeniedHandler(this::handleAccessDenied)
                )
                .authorizeHttpRequests(auth -> auth
                        // El acceso inicia sin token solo por los endpoints de autenticación.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/google"
                        ).permitAll()
                        // Los recursos funcionales requieren una identidad establecida por el filtro JWT.
                        .requestMatchers(
                                "/api/products/**",
                                "/api/movements/**",
                                "/api/alerts/**",
                                "/api/reports/**",
                                "/api/categories/**"
                        ).authenticated()
                        // Cualquier ruta que no esté declarada explícitamente queda bloqueada.
                        .anyRequest().denyAll()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    /**
     * Permite los orígenes, métodos y encabezados definidos en la configuración de la aplicación.
     *
     * @param allowedOrigins lista de orígenes autorizados separada por comas
     * @return origen de configuración CORS aplicado a todas las rutas
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins
    ) {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .toList()
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void handleUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        writeErrorResponse(
                response,
                HttpServletResponse.SC_UNAUTHORIZED,
                "No autenticado o token inválido"
        );
    }

    private void handleAccessDenied(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        writeErrorResponse(
                response,
                HttpServletResponse.SC_FORBIDDEN,
                "Acceso denegado"
        );
    }

    private void writeErrorResponse(
            HttpServletResponse response,
            int status,
            String message
    ) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"status\":" + status
                        + ",\"message\":\"" + message + "\"}"
        );
    }
}
