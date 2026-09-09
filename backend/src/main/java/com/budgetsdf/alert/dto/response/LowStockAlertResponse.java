package com.budgetsdf.alert.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LowStockAlertResponse {
    private Long productId;
    private String code;
    private String name;
    private Integer currentStock;
    private Integer minimumStock;
}
