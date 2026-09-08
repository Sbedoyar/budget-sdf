package com.budgetsdf.categoria.service;

import com.budgetsdf.categoria.dto.request.CategoriaRequest;
import com.budgetsdf.categoria.dto.response.CategoriaResponse;
import com.budgetsdf.categoria.entity.Categoria;
import com.budgetsdf.categoria.repository.CategoriaRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.producto.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoriaServiceTests {
    private CategoriaRepository categoriaRepository;
    private ProductoRepository productoRepository;
    private CategoriaService categoriaService;

    @BeforeEach
    void configurar() {
        categoriaRepository = mock(CategoriaRepository.class);
        productoRepository = mock(ProductoRepository.class);
        categoriaService = new CategoriaService(categoriaRepository, productoRepository);
    }

    @Test
    void creaCategoriaAplicandoTrim() {
        CategoriaRequest request = request("  Bebidas  ");
        when(categoriaRepository.existsByNombreIgnoreCase("Bebidas")).thenReturn(false);
        when(categoriaRepository.save(org.mockito.ArgumentMatchers.any(Categoria.class)))
                .thenAnswer(invocation -> {
                    Categoria categoria = invocation.getArgument(0);
                    categoria.setId(1L);
                    return categoria;
                });

        CategoriaResponse response = categoriaService.crearCategoria(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNombre()).isEqualTo("Bebidas");
    }

    @Test
    void impideCrearCategoriaDuplicadaSinDistinguirMayusculas() {
        CategoriaRequest request = request("bebidas");
        when(categoriaRepository.existsByNombreIgnoreCase("bebidas")).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.crearCategoria(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Ya existe una categoría con ese nombre");
        verify(categoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void informaCuandoLaCategoriaNoExiste() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoriaService.buscarPorId(99L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Categoría no encontrada");
    }

    @Test
    void actualizaCategoriaYAplicaTrim() {
        Categoria categoria = categoria(1L, "Bebidas");
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.findByNombreIgnoreCase("Alimentos")).thenReturn(Optional.empty());
        when(categoriaRepository.save(categoria)).thenReturn(categoria);

        CategoriaResponse response = categoriaService.actualizarCategoria(
                1L, request("  Alimentos "));

        assertThat(response.getNombre()).isEqualTo("Alimentos");
    }

    @Test
    void impideEliminarCategoriaConProductos() {
        Categoria categoria = categoria(1L, "Bebidas");
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.eliminarCategoria(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("No se puede eliminar la categoría porque tiene productos asociados");
        verify(categoriaRepository, never()).delete(categoria);
    }

    @Test
    void eliminaCategoriaSinProductos() {
        Categoria categoria = categoria(2L, "Granos");
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(categoria));
        when(productoRepository.existsByCategoriaId(2L)).thenReturn(false);

        categoriaService.eliminarCategoria(2L);

        verify(categoriaRepository).delete(categoria);
    }

    private CategoriaRequest request(String nombre) {
        CategoriaRequest request = new CategoriaRequest();
        request.setNombre(nombre);
        return request;
    }

    private Categoria categoria(Long id, String nombre) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNombre(nombre);
        return categoria;
    }
}
