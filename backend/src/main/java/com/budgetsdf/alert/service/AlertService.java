package com.budgetsdf.alert.service;

import com.budgetsdf.alert.dto.response.LowStockAlertResponse;
import com.budgetsdf.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Consulta los productos cuyo stock actual requiere atención.
 */
@Service
public class AlertService {
    private final ProductRepository productRepository;

    public AlertService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Obtiene los productos con stock igual o inferior al mínimo configurado.
     *
     * @return alertas con la identificación y los niveles de stock de cada producto
     */
    public List<LowStockAlertResponse> getLowStockProducts() {
        return productRepository.findByActiveTrue().stream()
                .filter(product -> product.getCurrentStock() <= product.getMinimumStock())
                .map(product -> new LowStockAlertResponse(
                        product.getId(), product.getCode(), product.getName(),
                        product.getCurrentStock(), product.getMinimumStock()))
                .toList();
    }
}
