package com.budgetsdf.alerta.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AlertaStockResponse {
    private Long productoId;
    private String codigo;
    private String nombre;
    private Integer stockActual;
    private Integer stockMinimo;
}
