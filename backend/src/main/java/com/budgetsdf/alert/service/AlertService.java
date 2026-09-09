package com.budgetsdf.alert.service;

import com.budgetsdf.alert.dto.response.LowStockAlertResponse;
import com.budgetsdf.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {
    private final ProductRepository productRepository;

    public AlertService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<LowStockAlertResponse> getLowStockProducts() {
        return productRepository.findAll().stream()
                .filter(product -> product.getCurrentStock() <= product.getMinimumStock())
                .map(product -> new LowStockAlertResponse(
                        product.getId(), product.getCode(), product.getName(),
                        product.getCurrentStock(), product.getMinimumStock()))
                .toList();
    }
}
