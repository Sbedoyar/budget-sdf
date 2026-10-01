package com.budgetsdf.movement.repository;

import com.budgetsdf.movement.entity.Movement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acceso JPA al historial de movimientos de inventario.
 */
public interface MovementRepository extends JpaRepository<Movement, Long> {

    /** Recupera todos los movimientos ordenados por fecha descendente. */
    List<Movement> findAllByOrderByDateDesc();

    /** Recupera los movimientos de un producto por fecha descendente. */
    List<Movement> findByProductIdOrderByDateDesc(Long productId);

    /** Comprueba si un producto tiene movimientos registrados. */
    boolean existsByProductId(Long productId);
}
