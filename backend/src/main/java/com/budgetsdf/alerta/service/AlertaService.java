package com.budgetsdf.alerta.service;

import com.budgetsdf.alerta.dto.response.AlertaStockResponse;
import com.budgetsdf.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertaService {
    private final ProductoRepository productoRepository;

    public AlertaService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<AlertaStockResponse> listarProductosConBajoStock() {
        return productoRepository.findAll().stream()
                .filter(producto -> producto.getStockActual() <= producto.getStockMinimo())
                .map(producto -> new AlertaStockResponse(
                        producto.getId(), producto.getCodigo(), producto.getNombre(),
                        producto.getStockActual(), producto.getStockMinimo()))
                .toList();
    }
}
