package com.budgetsdf.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Datos de entrada para crear o actualizar una categoría.
 */
@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100, message = "El nombre de la categoría no puede superar los 100 caracteres")
    private String name;
}
