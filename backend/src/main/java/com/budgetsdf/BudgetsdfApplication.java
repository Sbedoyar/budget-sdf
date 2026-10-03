package com.budgetsdf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

/**
 * Punto de entrada que inicia la aplicación Budget SDF con Spring Boot.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BudgetsdfApplication {

    /** Inicia el contexto de Spring y el servidor de la aplicación. */
    public static void main(String[] args) {
        SpringApplication.run(BudgetsdfApplication.class, args);
    }
}
