package com.budgetsdf.product.dto.response;

import lombok.Getter;
import lombok.Setter;

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
}
