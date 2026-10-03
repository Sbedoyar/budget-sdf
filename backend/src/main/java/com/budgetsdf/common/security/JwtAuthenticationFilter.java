package com.budgetsdf.common.security;

import com.budgetsdf.user.entity.User;
import com.budgetsdf.user.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Intercepta cada solicitud para autenticarla con el JWT del encabezado Authorization.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Valida el token Bearer y, si corresponde, registra la identidad en el contexto de seguridad.
     *
     * @param request solicitud HTTP entrante
     * @param response respuesta HTTP asociada
     * @param filterChain siguiente filtro de la cadena de Spring
     * @throws ServletException si falla el procesamiento del filtro
     * @throws IOException si ocurre un error de entrada o salida
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String token = authorization.substring(7);
                String username = jwtService.getUsername(token);
                User user = userRepository.findByUsername(username).orElse(null);
                // La autenticación se establece solo para un usuario existente y un token vigente.
                if (user != null && jwtService.isValid(token)) {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // Un token mal formado o inválido no debe dejar una identidad autenticada.
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
