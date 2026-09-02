package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumenMovimientosResponse {
    private long totalMovimientos;
    private long totalEntradas;
    private long totalSalidas;
    private long unidadesIngresadas;
    private long unidadesRetiradas;
    private long balanceUnidades;
}
