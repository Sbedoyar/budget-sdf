package com.budgetsdf.reporte.dto.response;

import com.budgetsdf.movimiento.entity.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MovimientoDetalleResponse {
    private Long id;
    private Long productoId;
    private String productoCodigo;
    private String productoNombre;
    private TipoMovimiento tipo;
    private Integer cantidad;
    private Integer stockResultante;
    private LocalDateTime fecha;
    private String observacion;
}
