package com.budgetsdf.alert.service;

import com.budgetsdf.alert.dto.response.LowStockAlertResponse;

import java.util.List;

/** Contrato de las operaciones del servicio de alertas. */
public interface AlertService {

    /**
     * Obtiene los productos con stock igual o inferior al mínimo configurado.
     *
     * @return alertas con la identificación y los niveles de stock de cada producto
     */
    List<LowStockAlertResponse> getLowStockProducts();
}
