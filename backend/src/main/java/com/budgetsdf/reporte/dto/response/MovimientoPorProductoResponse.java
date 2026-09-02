package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MovimientoPorProductoResponse {
    private Long productoId;
    private String codigo;
    private String nombre;
    private long totalMovimientos;
    private long totalEntradas;
    private long totalSalidas;
    private long unidadesIngresadas;
    private long unidadesRetiradas;
    private long balanceUnidades;
}
