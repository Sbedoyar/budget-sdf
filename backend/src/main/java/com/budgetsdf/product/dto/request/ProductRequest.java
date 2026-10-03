package com.budgetsdf.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Datos de entrada para crear o modificar la información de un producto.
 * Las anotaciones de validación definen los campos obligatorios y el mínimo de stock permitido.
 */
@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "El código es obligatorio")
    private String code;

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @NotBlank(message = "La unidad de medida es obligatoria")
    private String unitOfMeasure;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer minimumStock;
}
