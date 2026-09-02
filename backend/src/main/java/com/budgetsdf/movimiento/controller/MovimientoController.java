package com.budgetsdf.movimiento.controller;

import com.budgetsdf.movimiento.dto.request.MovimientoRequest;
import com.budgetsdf.movimiento.dto.response.MovimientoResponse;
import com.budgetsdf.movimiento.service.MovimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @PostMapping
    public ResponseEntity<MovimientoResponse> registrarMovimiento(
            @Valid @RequestBody MovimientoRequest request) {

        MovimientoResponse response =
                movimientoService.registrarMovimiento(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping
    public ResponseEntity<List<MovimientoResponse>> listarMovimientos() {

        List<MovimientoResponse> movimientos =
                movimientoService.listarMovimientos();

        return ResponseEntity.ok(movimientos);
    }
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoResponse>> listarMovimientosPorProducto(
            @PathVariable Long productoId) {

        List<MovimientoResponse> movimientos =
                movimientoService.listarMovimientosPorProducto(productoId);

        return ResponseEntity.ok(movimientos);
    }
}