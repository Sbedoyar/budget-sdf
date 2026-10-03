package com.budgetsdf.user.repository;

import com.budgetsdf.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Consultas de persistencia para encontrar usuarios por sus identificadores de acceso.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** Busca una cuenta por el nombre de usuario local. */
    Optional<User> findByUsername(String username);

    /** Busca una cuenta autorizada por su correo electrónico. */
    Optional<User> findByEmail(String email);

    /** Busca la cuenta vinculada al identificador estable de Google. */
    Optional<User> findByGoogleSubject(String googleSubject);
}