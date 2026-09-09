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

@Configuration
public class UserInitialConfig {
    @Bean
    CommandLineRunner createInitialUser(UserRepository userRepository,
                                           PasswordEncoder passwordEncoder,
                                           @Value("${app.admin.username}") String username,
                                           @Value("${app.admin.password}") String password) {
        return args -> {
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
