package com.budgetsdf.report.dto.response;

import com.budgetsdf.movement.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Datos de un movimiento individual dentro del reporte de actividad.
 */
@Getter
@AllArgsConstructor
public class MovementDetailResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private MovementType type;
    private Integer quantity;
    private Integer resultingStock;
    private LocalDateTime date;
    private String observation;
}
