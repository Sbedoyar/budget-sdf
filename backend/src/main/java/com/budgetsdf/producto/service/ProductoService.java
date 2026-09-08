package com.budgetsdf.producto.service;

import com.budgetsdf.categoria.entity.Categoria;
import com.budgetsdf.categoria.repository.CategoriaRepository;
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
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public ProductoResponse crearProducto(ProductoRequest request) {

        if (productoRepository.existsByCodigo(request.getCodigo())) {
            throw new BusinessException("Ya existe un producto con ese código");
        }

        Categoria categoria = buscarCategoria(request.getCategoriaId());
        Producto producto = new Producto();

        producto.setCodigo(request.getCodigo());
        producto.setNombre(request.getNombre());
        producto.setCategoria(categoria);
        producto.setUnidadMedida(request.getUnidadMedida());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setStockActual(0);

        Producto productoGuardado = productoRepository.save(producto);

        return convertirAResponse(productoGuardado);
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
        response.setCategoriaId(producto.getCategoria().getId());
        response.setCategoria(producto.getCategoria().getNombre());
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
        producto.setCategoria(buscarCategoria(request.getCategoriaId()));
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

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Categoría no encontrada"));
    }
}
