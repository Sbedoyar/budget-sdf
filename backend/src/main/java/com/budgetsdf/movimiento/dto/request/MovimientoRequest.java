package com.budgetsdf.movimiento.dto.request;

import com.budgetsdf.movimiento.entity.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovimientoRequest {

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipo;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private Integer cantidad;

    private String observacion;
}