package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReporteMovimientosResponse {
    private ResumenMovimientosResponse resumen;
    private List<MovimientoPorProductoResponse> porProducto;
    private List<MovimientoDetalleResponse> movimientos;
}
