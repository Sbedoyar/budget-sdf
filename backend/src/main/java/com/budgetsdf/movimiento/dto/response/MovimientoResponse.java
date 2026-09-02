package com.budgetsdf.movimiento.dto.response;

import com.budgetsdf.movimiento.entity.TipoMovimiento;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MovimientoResponse {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private TipoMovimiento tipo;
    private Integer cantidad;
    private LocalDateTime fecha;
    private String observacion;
    private Integer stockResultante;
}