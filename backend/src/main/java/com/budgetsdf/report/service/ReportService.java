package com.budgetsdf.report.service;

import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.report.dto.response.InventoryReportResponse;
import com.budgetsdf.report.dto.response.MovementReportResponse;

import java.time.LocalDate;
import java.util.List;

/** Contrato de las operaciones del servicio de reportes. */
public interface ReportService {

    /**
     * Genera el detalle de productos y los totales por estado de stock.
     *
     * @return reporte general del inventario
     */
    InventoryReportResponse generateInventoryReport();

    /**
     * Genera el reporte completo de movimientos sin aplicar filtros.
     *
     * @return reporte con todos los movimientos registrados
     */
    MovementReportResponse generateMovementReport();

    /**
     * Mantiene compatibilidad con el filtro anterior
     * de un único producto.
     *
     * @param from fecha inicial del período
     * @param to fecha final del período
     * @param type tipo de movimiento
     * @param productId identificador de un único producto
     * @return reporte de movimientos filtrado
     */
    MovementReportResponse generateMovementReport(
            LocalDate from,
            LocalDate to,
            MovementType type,
            Long productId
    );

    /**
     * Genera un reporte de movimientos aplicando filtros opcionales
     * y permitiendo seleccionar varios productos.
     *
     * Si la lista de productos está vacía, el reporte incluye
     * movimientos de todos los productos.
     *
     * @param from fecha inicial del período
     * @param to fecha final del período
     * @param type tipo de movimiento
     * @param productIds identificadores de los productos seleccionados
     * @return reporte de movimientos filtrado
     */
    MovementReportResponse generateMovementReport(
            LocalDate from,
            LocalDate to,
            MovementType type,
            List<Long> productIds
    );
}
