package com.budgetsdf.report.controller;

import com.budgetsdf.report.dto.response.InventoryReportResponse;
import com.budgetsdf.report.dto.response.MovementReportResponse;
import com.budgetsdf.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Publica los endpoints de consulta de reportes de inventario y movimientos.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Solicita el reporte actual de existencias.
     *
     * @return resumen y detalle de productos por estado de stock
     */
    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportResponse> getInventoryReport() {
        return ResponseEntity.ok(reportService.generateInventoryReport());
    }

    /**
     * Solicita el reporte acumulado de movimientos.
     *
     * @return totales globales, totales por producto y movimientos detallados
     */
    @GetMapping("/movements")
    public ResponseEntity<MovementReportResponse> getMovementReport() {
        return ResponseEntity.ok(reportService.generateMovementReport());
    }
}
