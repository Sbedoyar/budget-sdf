package com.budgetsdf.report.controller;

import com.budgetsdf.report.dto.response.InventoryReportResponse;
import com.budgetsdf.report.dto.response.MovementReportResponse;
import com.budgetsdf.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportResponse> getInventoryReport() {
        return ResponseEntity.ok(reportService.generateInventoryReport());
    }

    @GetMapping("/movements")
    public ResponseEntity<MovementReportResponse> getMovementReport() {
        return ResponseEntity.ok(reportService.generateMovementReport());
    }
}
