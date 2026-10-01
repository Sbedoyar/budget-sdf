package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Respuesta del reporte con agregados globales, agrupación por producto y detalle.
 */
@Getter
@AllArgsConstructor
public class MovementReportResponse {
    private MovementSummaryResponse summary;
    private List<ProductMovementSummaryResponse> byProduct;
    private List<MovementDetailResponse> movements;
}
