package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MovementReportResponse {
    private MovementSummaryResponse summary;
    private List<ProductMovementSummaryResponse> byProduct;
    private List<MovementDetailResponse> movements;
}
