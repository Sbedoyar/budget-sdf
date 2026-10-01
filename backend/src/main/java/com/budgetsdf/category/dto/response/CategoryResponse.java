package com.budgetsdf.category.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Datos públicos de una categoría devueltos por la API.
 */
@Getter
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
}
