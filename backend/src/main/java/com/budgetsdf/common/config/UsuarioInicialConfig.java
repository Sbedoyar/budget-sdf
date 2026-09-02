package com.budgetsdf.common.config;

import com.budgetsdf.usuario.entity.RolUsuario;
import com.budgetsdf.usuario.entity.Usuario;
import com.budgetsdf.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
public class UsuarioInicialConfig {
    @Bean
    CommandLineRunner crearUsuarioInicial(UsuarioRepository usuarioRepository,
                                           PasswordEncoder passwordEncoder,
                                           @Value("${app.admin.username}") String username,
                                           @Value("${app.admin.password}") String password) {
        return args -> {
            if (usuarioRepository.count() == 0 && StringUtils.hasText(username) && StringUtils.hasText(password)) {
                Usuario usuario = new Usuario();
                usuario.setUsername(username.trim());
                usuario.setPassword(passwordEncoder.encode(password));
                usuario.setRol(RolUsuario.PROPIETARIO);
                usuarioRepository.save(usuario);
            }
        };
    }
}
