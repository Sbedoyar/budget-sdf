package com.budgetsdf.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MovementSummaryResponse {
    private long totalMovements;
    private long totalInbound;
    private long totalOutbound;
    private long inboundUnits;
    private long outboundUnits;
    private long unitBalance;
}
