package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReporteInventarioResponse {
    private ResumenInventarioResponse resumen;
    private List<ProductoInventarioResponse> productos;
}
