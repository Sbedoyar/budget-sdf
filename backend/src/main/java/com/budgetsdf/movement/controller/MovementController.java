package com.budgetsdf.movement.controller;

import com.budgetsdf.movement.dto.request.MovementRequest;
import com.budgetsdf.movement.dto.response.MovementResponse;
import com.budgetsdf.movement.service.MovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Recibe solicitudes para registrar y consultar movimientos de inventario.
 */
@RestController
@RequestMapping("/api/movements")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    /**
     * Registra una entrada o salida con los datos validados de la solicitud.
     *
     * @param request datos del movimiento
     * @return movimiento registrado con estado HTTP 201
     */
    @PostMapping
    public ResponseEntity<MovementResponse> recordMovement(
            @Valid @RequestBody MovementRequest request) {

        MovementResponse response =
                movementService.recordMovement(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    /**
     * Lista el historial general de movimientos.
     *
     * @return movimientos ordenados del más reciente al más antiguo
     */
    @GetMapping
    public ResponseEntity<List<MovementResponse>> getAllMovements() {

        List<MovementResponse> movements =
                movementService.getAllMovements();

        return ResponseEntity.ok(movements);
    }
    /**
     * Consulta los movimientos asociados a un producto.
     *
     * @param productId identificador del producto recibido en la ruta
     * @return historial del producto
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MovementResponse>> getMovementsByProduct(
            @PathVariable Long productId) {

        List<MovementResponse> movements =
                movementService.getMovementsByProduct(productId);

        return ResponseEntity.ok(movements);
    }
}
