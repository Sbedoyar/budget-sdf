package com.budgetsdf.alert.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Datos de un producto que alcanzó o quedó por debajo de su stock mínimo.
 */
@Getter
@AllArgsConstructor
public class LowStockAlertResponse {
    private Long productId;
    private String code;
    private String name;
    private Integer currentStock;
    private Integer minimumStock;
}
