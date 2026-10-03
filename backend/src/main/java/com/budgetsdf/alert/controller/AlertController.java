package com.budgetsdf.alert.controller;

import com.budgetsdf.alert.dto.response.LowStockAlertResponse;
import com.budgetsdf.alert.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Expone los endpoints de consulta de alertas de inventario.
 */
@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * Devuelve las alertas de productos con stock bajo o agotado.
     *
     * @return respuesta HTTP con la lista de alertas
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockAlertResponse>> getLowStockProducts() {
        return ResponseEntity.ok(alertService.getLowStockProducts());
    }
}
