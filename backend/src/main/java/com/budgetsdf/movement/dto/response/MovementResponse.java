package com.budgetsdf.movement.dto.response;

import com.budgetsdf.movement.entity.MovementType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Información de un movimiento devuelta por los endpoints de inventario.
 */
@Getter
@Setter
public class MovementResponse {

    private Long id;
    private Long productId;
    private String productName;
    private MovementType type;
    private Integer quantity;
    private LocalDateTime date;
    private String observation;
    private Integer resultingStock;
}
