package com.budgetsdf.movement.repository;

import com.budgetsdf.movement.entity.Movement;
import com.budgetsdf.movement.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    /**
     * Consulta movimientos aplicando filtros opcionales de fecha y tipo.
     * Se utiliza cuando el reporte incluye todos los productos.
     *
     * @param from fecha y hora inicial del período
     * @param to fecha y hora límite exclusiva del período
     * @param type tipo de movimiento a consultar
     * @return movimientos que cumplen los filtros indicados
     */
    @Query("""
            SELECT m
            FROM Movement m
            WHERE (:from IS NULL OR m.date >= :from)
              AND (:to IS NULL OR m.date < :to)
              AND (:type IS NULL OR m.type = :type)
            ORDER BY m.date DESC
            """)
    List<Movement> findForReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("type") MovementType type
    );

    /**
     * Consulta movimientos aplicando filtros opcionales y limitando
     * el resultado a los productos seleccionados.
     *
     * @param from fecha y hora inicial del período
     * @param to fecha y hora límite exclusiva del período
     * @param type tipo de movimiento a consultar
     * @param productIds identificadores de los productos seleccionados
     * @return movimientos correspondientes a los productos indicados
     */
    @Query("""
            SELECT m
            FROM Movement m
            WHERE (:from IS NULL OR m.date >= :from)
              AND (:to IS NULL OR m.date < :to)
              AND (:type IS NULL OR m.type = :type)
              AND m.product.id IN :productIds
            ORDER BY m.date DESC
            """)
    List<Movement> findForReportByProductIds(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("type") MovementType type,
            @Param("productIds") List<Long> productIds
    );
}