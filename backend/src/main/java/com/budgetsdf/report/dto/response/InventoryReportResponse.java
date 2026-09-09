package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class InventoryReportResponse {
    private InventorySummaryResponse summary;
    private List<InventoryProductResponse> products;
}
