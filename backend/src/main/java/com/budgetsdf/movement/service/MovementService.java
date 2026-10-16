package com.budgetsdf.movement.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movement.dto.request.MovementRequest;
import com.budgetsdf.movement.dto.response.MovementResponse;

import java.util.List;

/** Contrato de las operaciones del servicio de movimientos. */
public interface MovementService {

    /**
     * Registra una entrada o salida y actualiza el stock dentro de la misma transacción.
     *
     * @param request producto, tipo, cantidad y observación del movimiento
     * @return movimiento guardado con el stock resultante
     * @throws BusinessException si el producto no existe o una salida supera el stock disponible
     */
    MovementResponse recordMovement(MovementRequest request);

    /**
     * Recupera todos los movimientos del más reciente al más antiguo.
     *
     * @return movimientos convertidos al formato de respuesta
     */
    List<MovementResponse> getAllMovements();

    /**
     * Recupera el historial de movimientos de un producto existente.
     *
     * @param productId identificador del producto
     * @return movimientos del producto ordenados por fecha descendente
     * @throws BusinessException si el producto no existe
     */
    List<MovementResponse> getMovementsByProduct(Long productId);
}
