package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InventorySummaryResponse {
    private long totalProducts;
    private long totalUnitsInStock;
    private long productsWithLowStock;
    private long productsOutOfStock;
    private long productsWithNormalStock;
}
