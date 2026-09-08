package com.budgetsdf.producto.service;

import com.budgetsdf.categoria.entity.Categoria;
import com.budgetsdf.categoria.repository.CategoriaRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movimiento.repository.MovimientoRepository;
import com.budgetsdf.producto.dto.request.ProductoRequest;
import com.budgetsdf.producto.dto.response.ProductoResponse;
import com.budgetsdf.producto.entity.Producto;
import com.budgetsdf.producto.repository.ProductoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductoServiceTests {

    private ProductoRepository productoRepository;
    private CategoriaRepository categoriaRepository;
    private MovimientoRepository movimientoRepository;
    private ProductoService productoService;

    @BeforeEach
    void configurar() {
        productoRepository = mock(ProductoRepository.class);
        categoriaRepository = mock(CategoriaRepository.class);
        movimientoRepository = mock(MovimientoRepository.class);

        productoService = new ProductoService(
                productoRepository,
                categoriaRepository,
                movimientoRepository
        );
    }

    @Test
    void creaProductoConCategoriaExistente() {
        Categoria categoria = categoria(1L, "Bebidas");
        configurarCreacion(categoria);

        productoService.crearProducto(request(1L));

        verify(productoRepository).save(
                org.mockito.ArgumentMatchers.argThat(
                        producto -> producto.getCategoria() == categoria
                )
        );
    }

    @Test
    void rechazaCategoriaInexistenteAlCrear() {
        ProductoRequest request = request(99L);

        when(productoRepository.existsByCodigo(request.getCodigo())).thenReturn(false);
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.crearProducto(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Categoría no encontrada");

        verify(productoRepository, never()).save(any());
    }

    @Test
    void actualizaLaCategoriaSinModificarElStockActual() {
        Categoria anterior = categoria(1L, "Bebidas");
        Categoria nueva = categoria(2L, "Granos");

        Producto producto = producto(5L, anterior, 12);

        when(productoRepository.findById(5L)).thenReturn(Optional.of(producto));
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(nueva));
        when(productoRepository.save(producto)).thenReturn(producto);

        ProductoRequest request = request(2L);

        ProductoResponse response =
                productoService.actualizarProducto(5L, request);

        assertThat(response.getCategoriaId()).isEqualTo(2L);
        assertThat(response.getCategoria()).isEqualTo("Granos");
        assertThat(response.getStockActual()).isEqualTo(12);
    }

    @Test
    void responseDevuelveIdYNombreDeCategoria() {
        Categoria categoria = categoria(7L, "Aseo");

        Producto producto = producto(10L, categoria, 4);

        when(productoRepository.findById(10L))
                .thenReturn(Optional.of(producto));

        ProductoResponse response =
                productoService.buscarPorId(10L);

        assertThat(response.getCategoriaId()).isEqualTo(7L);
        assertThat(response.getCategoria()).isEqualTo("Aseo");
    }

    @Test
    void productoNuevoConservaStockInicialEnCero() {
        configurarCreacion(categoria(1L, "Bebidas"));

        ProductoResponse response =
                productoService.crearProducto(request(1L));

        assertThat(response.getStockActual()).isZero();
    }

    private void configurarCreacion(Categoria categoria) {

        when(productoRepository.existsByCodigo("P001"))
                .thenReturn(false);

        when(categoriaRepository.findById(categoria.getId()))
                .thenReturn(Optional.of(categoria));

        when(productoRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> {
                    Producto producto = invocation.getArgument(0);
                    producto.setId(1L);
                    return producto;
                });
    }

    private ProductoRequest request(Long categoriaId) {

        ProductoRequest request = new ProductoRequest();

        request.setCodigo("P001");
        request.setNombre("Coca Cola 1.5L");
        request.setCategoriaId(categoriaId);
        request.setUnidadMedida("Unidad");
        request.setStockMinimo(5);

        return request;
    }

    private Categoria categoria(Long id, String nombre) {

        Categoria categoria = new Categoria();

        categoria.setId(id);
        categoria.setNombre(nombre);

        return categoria;
    }

    private Producto producto(Long id,
                              Categoria categoria,
                              int stockActual) {

        Producto producto = new Producto();

        producto.setId(id);
        producto.setCodigo("P001");
        producto.setNombre("Producto");
        producto.setCategoria(categoria);
        producto.setUnidadMedida("Unidad");
        producto.setStockActual(stockActual);
        producto.setStockMinimo(5);

        return producto;
    }
}