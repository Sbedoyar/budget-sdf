package com.budgetsdf.alerta.controller;

import com.budgetsdf.alerta.dto.response.AlertaStockResponse;
import com.budgetsdf.alerta.service.AlertaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {
    private final AlertaService alertaService;

    public AlertaController(AlertaService alertaService) {
        this.alertaService = alertaService;
    }

    @GetMapping("/bajo-stock")
    public ResponseEntity<List<AlertaStockResponse>> listarBajoStock() {
        return ResponseEntity.ok(alertaService.listarProductosConBajoStock());
    }
}
