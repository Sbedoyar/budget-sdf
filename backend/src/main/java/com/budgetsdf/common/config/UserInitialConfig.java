package com.budgetsdf.common.config;

import com.budgetsdf.user.entity.UserRole;
import com.budgetsdf.user.entity.User;
import com.budgetsdf.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

/**
 * Configuración que prepara la cuenta propietaria inicial cuando la base no tiene usuarios.
 */
@Configuration
public class UserInitialConfig {

    /**
     * Registra la cuenta inicial usando las credenciales de configuración y contraseña codificada.
     *
     * @param userRepository repositorio para comprobar y guardar usuarios
     * @param passwordEncoder codificador de contraseñas configurado por Spring Security
     * @param username nombre inicial leído de la configuración
     * @param password contraseña inicial leída de la configuración
     * @return tarea de inicialización ejecutada al arrancar la aplicación
     */
    @Bean
    CommandLineRunner createInitialUser(UserRepository userRepository,
                                           PasswordEncoder passwordEncoder,
                                           @Value("${app.admin.username}") String username,
                                           @Value("${app.admin.password}") String password) {
        return args -> {
            // La cuenta se crea solo en una base vacía y si ambas credenciales están configuradas.
            if (userRepository.count() == 0 && StringUtils.hasText(username) && StringUtils.hasText(password)) {
                User user = new User();
                user.setUsername(username.trim());
                user.setPassword(passwordEncoder.encode(password));
                user.setRole(UserRole.PROPIETARIO);
                userRepository.save(user);
            }
        };
    }
}
