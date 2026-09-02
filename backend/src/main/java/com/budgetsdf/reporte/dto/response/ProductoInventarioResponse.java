package com.budgetsdf.reporte.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductoInventarioResponse {
    private Long productoId;
    private String codigo;
    private String nombre;
    private String categoria;
    private String unidadMedida;
    private Integer stockActual;
    private Integer stockMinimo;
    private EstadoStock estadoStock;
}
