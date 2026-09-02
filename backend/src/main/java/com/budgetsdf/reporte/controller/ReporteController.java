package com.budgetsdf.reporte.controller;

import com.budgetsdf.reporte.dto.response.ReporteInventarioResponse;
import com.budgetsdf.reporte.dto.response.ReporteMovimientosResponse;
import com.budgetsdf.reporte.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/inventario")
    public ResponseEntity<ReporteInventarioResponse> obtenerInventario() {
        return ResponseEntity.ok(reporteService.generarReporteInventario());
    }

    @GetMapping("/movimientos")
    public ResponseEntity<ReporteMovimientosResponse> obtenerMovimientos() {
        return ResponseEntity.ok(reporteService.generarReporteMovimientos());
    }
}
