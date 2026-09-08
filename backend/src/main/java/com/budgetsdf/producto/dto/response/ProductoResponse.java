package com.budgetsdf.producto.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private Long categoriaId;
    private String categoria;
    private String unidadMedida;
    private Integer stockActual;
    private Integer stockMinimo;
}
