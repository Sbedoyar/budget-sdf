package com.budgetsdf.movement.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movement.dto.request.MovementRequest;
import com.budgetsdf.movement.dto.response.MovementResponse;
import com.budgetsdf.movement.entity.Movement;
import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.entity.Product;
import com.budgetsdf.product.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Registra movimientos de inventario y mantiene sincronizado el stock de cada producto.
 */
@Service
public class MovementService {

    private final MovementRepository movementRepository;
    private final ProductRepository productRepository;

    public MovementService(
            MovementRepository movementRepository,
            ProductRepository productRepository) {

        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
    }

    /**
     * Registra una entrada o salida y actualiza el stock dentro de la misma transacción.
     *
     * @param request producto, tipo, cantidad y observación del movimiento
     * @return movimiento guardado con el stock resultante
     * @throws BusinessException si el producto no existe o una salida supera el stock disponible
     */
    @Transactional
    public MovementResponse recordMovement(MovementRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (Boolean.FALSE.equals(product.getActive())) {
            throw new BusinessException(
                    "El producto está inactivo y no permite registrar movimientos"
            );
        }

        if (request.getType() == MovementType.ENTRADA) {

            product.setCurrentStock(
                    product.getCurrentStock() + request.getQuantity()
            );

        } else if (request.getType() == MovementType.SALIDA) {

            // Evita que una salida deje el inventario con una cantidad negativa.
            if (product.getCurrentStock() < request.getQuantity()) {
                throw new BusinessException("Stock insuficiente");
            }

            product.setCurrentStock(
                    product.getCurrentStock() - request.getQuantity()
            );
        }

        productRepository.save(product);

        Movement movement = new Movement();

        movement.setProduct(product);
        movement.setType(request.getType());
        movement.setQuantity(request.getQuantity());
        movement.setResultingStock(product.getCurrentStock());
        movement.setDate(LocalDateTime.now());
        movement.setObservation(request.getObservation());

        Movement savedMovement =
                movementRepository.save(movement);

        MovementResponse response = new MovementResponse();

        response.setId(savedMovement.getId());
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setType(savedMovement.getType());
        response.setQuantity(savedMovement.getQuantity());
        response.setDate(savedMovement.getDate());
        response.setObservation(savedMovement.getObservation());
        response.setResultingStock(savedMovement.getResultingStock());

        return response;
    }
    /**
     * Recupera todos los movimientos del más reciente al más antiguo.
     *
     * @return movimientos convertidos al formato de respuesta
     */
    public List<MovementResponse> getAllMovements() {

        return movementRepository.findAllByOrderByDateDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Recupera el historial de movimientos de un producto existente.
     *
     * @param productId identificador del producto
     * @return movimientos del producto ordenados por fecha descendente
     * @throws BusinessException si el producto no existe
     */
    public List<MovementResponse> getMovementsByProduct(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new BusinessException("Producto no encontrado");
        }

        return movementRepository
                .findByProductIdOrderByDateDesc(productId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
    private MovementResponse convertToResponse(Movement movement) {

        MovementResponse response = new MovementResponse();

        response.setId(movement.getId());
        response.setProductId(movement.getProduct().getId());
        response.setProductName(movement.getProduct().getName());
        response.setType(movement.getType());
        response.setQuantity(movement.getQuantity());
        response.setDate(movement.getDate());
        response.setObservation(movement.getObservation());
        response.setResultingStock(movement.getResultingStock());

        return response;
    }
}
