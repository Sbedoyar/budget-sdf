package com.budgetsdf.report.controller;

import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.report.dto.response.InventoryReportResponse;
import com.budgetsdf.report.dto.response.MovementReportResponse;
import com.budgetsdf.report.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Controlador REST encargado de exponer los reportes
 * de inventario y movimientos de Budget SDF.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Obtiene el reporte actual del inventario.
     *
     * @return reporte consolidado del inventario
     */
    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportResponse> getInventoryReport() {

        return ResponseEntity.ok(
                reportService.generateInventoryReport()
        );
    }

    /**
     * Obtiene el reporte de movimientos aplicando filtros opcionales.
     *
     * Permite filtrar por período, tipo de movimiento y varios
     * productos simultáneamente.
     *
     * @param from fecha inicial del período
     * @param to fecha final del período
     * @param type tipo de movimiento
     * @param productIds identificadores de los productos seleccionados
     * @return reporte de movimientos filtrado
     */
    @GetMapping("/movements")
    public ResponseEntity<MovementReportResponse> getMovementReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(required = false)
            MovementType type,

            @RequestParam(required = false)
            List<Long> productIds
    ) {

        return ResponseEntity.ok(
                reportService.generateMovementReport(
                        from,
                        to,
                        type,
                        productIds
                )
        );
    }
}