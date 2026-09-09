package com.budgetsdf.movement.controller;

import com.budgetsdf.movement.dto.request.MovementRequest;
import com.budgetsdf.movement.dto.response.MovementResponse;
import com.budgetsdf.movement.service.MovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movements")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    @PostMapping
    public ResponseEntity<MovementResponse> recordMovement(
            @Valid @RequestBody MovementRequest request) {

        MovementResponse response =
                movementService.recordMovement(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping
    public ResponseEntity<List<MovementResponse>> getAllMovements() {

        List<MovementResponse> movements =
                movementService.getAllMovements();

        return ResponseEntity.ok(movements);
    }
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MovementResponse>> getMovementsByProduct(
            @PathVariable Long productId) {

        List<MovementResponse> movements =
                movementService.getMovementsByProduct(productId);

        return ResponseEntity.ok(movements);
    }
}
