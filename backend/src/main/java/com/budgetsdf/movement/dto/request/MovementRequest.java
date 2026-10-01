package com.budgetsdf.movement.dto.request;

import com.budgetsdf.movement.entity.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Datos de entrada de un movimiento; sus validaciones exigen producto y cantidad positiva.
 */
@Getter
@Setter
public class MovementRequest {

    @NotNull(message = "El producto es obligatorio")
    private Long productId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private MovementType type;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private Integer quantity;

    private String observation;
}
