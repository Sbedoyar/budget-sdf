package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Totales de movimientos y balance de unidades correspondientes a un producto.
 */
@Getter
@AllArgsConstructor
public class ProductMovementSummaryResponse {
    private Long productId;
    private String code;
    private String name;
    private long totalMovements;
    private long totalInbound;
    private long totalOutbound;
    private long inboundUnits;
    private long outboundUnits;
    private long unitBalance;
}
