package com.budgetsdf.product.dto.response;

import lombok.Getter;
import lombok.Setter;

/**
 * Datos de un producto expuestos por la API, incluida su categoría y nivel de stock.
 */
@Getter
@Setter
public class ProductResponse {

    private Long id;
    private String code;
    private String name;
    private Long categoryId;
    private String category;
    private String unitOfMeasure;
    private Integer currentStock;
    private Integer minimumStock;
    private Boolean active;
}
