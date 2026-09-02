package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumenInventarioResponse {
    private long totalProductos;
    private long totalUnidadesEnStock;
    private long productosConBajoStock;
    private long productosSinStock;
    private long productosConStockNormal;
}
