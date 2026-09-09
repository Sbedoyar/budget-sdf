package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InventoryProductResponse {
    private Long productId;
    private String code;
    private String name;
    private String category;
    private String unitOfMeasure;
    private Integer currentStock;
    private Integer minimumStock;
    private StockStatus stockStatus;
}
