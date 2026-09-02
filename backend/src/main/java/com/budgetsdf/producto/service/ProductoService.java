package com.budgetsdf.producto.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.producto.dto.request.ProductoRequest;
import com.budgetsdf.producto.dto.response.ProductoResponse;
import com.budgetsdf.producto.entity.Producto;
import com.budgetsdf.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public ProductoResponse crearProducto(ProductoRequest request) {

        if (productoRepository.existsByCodigo(request.getCodigo())) {
            throw new BusinessException("Ya existe un producto con ese código");
        }

        Producto producto = new Producto();

        producto.setCodigo(request.getCodigo());
        producto.setNombre(request.getNombre());
        producto.setCategoria(request.getCategoria());
        producto.setUnidadMedida(request.getUnidadMedida());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setStockActual(0);

        Producto productoGuardado = productoRepository.save(producto);

        ProductoResponse response = new ProductoResponse();

        response.setId(productoGuardado.getId());
        response.setCodigo(productoGuardado.getCodigo());
        response.setNombre(productoGuardado.getNombre());
        response.setCategoria(productoGuardado.getCategoria());
        response.setUnidadMedida(productoGuardado.getUnidadMedida());
        response.setStockActual(productoGuardado.getStockActual());
        response.setStockMinimo(productoGuardado.getStockMinimo());

        return response;
    }

    public List<ProductoResponse> listarProductos() {

    return productoRepository.findAll()
            .stream()
            .map(this::convertirAResponse)
            .toList();
    }

    private ProductoResponse convertirAResponse(Producto producto) {
        ProductoResponse response = new ProductoResponse();

        response.setId(producto.getId());
        response.setCodigo(producto.getCodigo());
        response.setNombre(producto.getNombre());
        response.setCategoria(producto.getCategoria());
        response.setUnidadMedida(producto.getUnidadMedida());
        response.setStockActual(producto.getStockActual());
        response.setStockMinimo(producto.getStockMinimo());

        return response;
    }

    public ProductoResponse buscarPorId(Long id) {

    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Producto no encontrado"));

    return convertirAResponse(producto);
    }

    public ProductoResponse actualizarProducto(Long id, ProductoRequest request) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (!producto.getCodigo().equals(request.getCodigo())
                && productoRepository.existsByCodigo(request.getCodigo())) {

            throw new BusinessException("Ya existe un producto con ese código");
        }

        producto.setCodigo(request.getCodigo());
        producto.setNombre(request.getNombre());
        producto.setCategoria(request.getCategoria());
        producto.setUnidadMedida(request.getUnidadMedida());
        producto.setStockMinimo(request.getStockMinimo());

        Producto productoActualizado = productoRepository.save(producto);

        return convertirAResponse(productoActualizado);
    }

    public void eliminarProducto(Long id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        productoRepository.delete(producto);
    }
}