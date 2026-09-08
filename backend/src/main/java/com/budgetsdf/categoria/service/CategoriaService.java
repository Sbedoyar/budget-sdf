package com.budgetsdf.categoria.service;

import com.budgetsdf.categoria.dto.request.CategoriaRequest;
import com.budgetsdf.categoria.dto.response.CategoriaResponse;
import com.budgetsdf.categoria.entity.Categoria;
import com.budgetsdf.categoria.repository.CategoriaRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository,
                            ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public CategoriaResponse crearCategoria(CategoriaRequest request) {
        String nombre = normalizarNombre(request.getNombre());
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }

        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        return convertirAResponse(categoriaRepository.save(categoria));
    }

    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAllByOrderByNombreAsc().stream()
                .map(this::convertirAResponse)
                .toList();
    }

    public CategoriaResponse buscarPorId(Long id) {
        return convertirAResponse(buscarCategoria(id));
    }

    public CategoriaResponse actualizarCategoria(Long id, CategoriaRequest request) {
        Categoria categoria = buscarCategoria(id);
        String nombre = normalizarNombre(request.getNombre());

        categoriaRepository.findByNombreIgnoreCase(nombre)
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(existente -> {
                    throw new BusinessException("Ya existe una categoría con ese nombre");
                });

        categoria.setNombre(nombre);
        return convertirAResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        Categoria categoria = buscarCategoria(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new BusinessException(
                    "No se puede eliminar la categoría porque tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Categoría no encontrada"));
    }

    private String normalizarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BusinessException("El nombre de la categoría es obligatorio");
        }
        return nombre.trim();
    }

    private CategoriaResponse convertirAResponse(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre());
    }
}
