package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Respuesta compuesta por el resumen y los productos del reporte de inventario.
 */
@Getter
@AllArgsConstructor
public class InventoryReportResponse {
    private InventorySummaryResponse summary;
    private List<InventoryProductResponse> products;
}
