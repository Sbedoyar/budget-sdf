package com.budgetsdf.reporte.service;

import com.budgetsdf.categoria.entity.Categoria;
import com.budgetsdf.movimiento.entity.Movimiento;
import com.budgetsdf.movimiento.entity.TipoMovimiento;
import com.budgetsdf.movimiento.repository.MovimientoRepository;
import com.budgetsdf.producto.entity.Producto;
import com.budgetsdf.producto.repository.ProductoRepository;
import com.budgetsdf.reporte.dto.response.EstadoStock;
import com.budgetsdf.reporte.dto.response.ReporteInventarioResponse;
import com.budgetsdf.reporte.dto.response.ReporteMovimientosResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReporteServiceTests {
    private ProductoRepository productoRepository;
    private MovimientoRepository movimientoRepository;
    private ReporteService reporteService;

    @BeforeEach
    void configurar() {
        productoRepository = mock(ProductoRepository.class);
        movimientoRepository = mock(MovimientoRepository.class);
        reporteService = new ReporteService(productoRepository, movimientoRepository);
    }

    @Test
    void clasificaProductosSinDobleConteoYLosOrdenaPorPrioridadYNombre() {
        Producto normal = producto(1L, "P001", "Café", 6, 5);
        Producto igualMinimo = producto(2L, "P002", "Arroz", 5, 5);
        Producto bajo = producto(3L, "P003", "Azúcar", 2, 5);
        Producto sinStock = producto(4L, "P004", "Leche", 0, 5);
        when(productoRepository.findAll()).thenReturn(List.of(normal, igualMinimo, bajo, sinStock));

        ReporteInventarioResponse reporte = reporteService.generarReporteInventario();

        assertThat(reporte.getResumen().getTotalProductos()).isEqualTo(4);
        assertThat(reporte.getResumen().getTotalUnidadesEnStock()).isEqualTo(13);
        assertThat(reporte.getResumen().getProductosSinStock()).isEqualTo(1);
        assertThat(reporte.getResumen().getProductosConBajoStock()).isEqualTo(2);
        assertThat(reporte.getResumen().getProductosConStockNormal()).isEqualTo(1);
        assertThat(reporte.getProductos()).extracting("estadoStock")
                .containsExactly(EstadoStock.SIN_STOCK, EstadoStock.BAJO_STOCK,
                        EstadoStock.BAJO_STOCK, EstadoStock.NORMAL);
        assertThat(reporte.getProductos()).extracting("nombre")
                .containsExactly("Leche", "Arroz", "Azúcar", "Café");
    }

    @Test
    void devuelveInventarioVacioSinExcepcion() {
        when(productoRepository.findAll()).thenReturn(List.of());

        ReporteInventarioResponse reporte = reporteService.generarReporteInventario();

        assertThat(reporte.getResumen().getTotalProductos()).isZero();
        assertThat(reporte.getResumen().getTotalUnidadesEnStock()).isZero();
        assertThat(reporte.getProductos()).isEmpty();
    }

    @Test
    void calculaAgrupacionesYConservaElHistorialRecientePrimero() {
        Producto arroz = producto(1L, "P001", "Arroz", 8, 3);
        Producto leche = producto(2L, "P002", "Leche", 4, 2);
        Movimiento masReciente = movimiento(3L, arroz, TipoMovimiento.SALIDA, 2, 8,
                LocalDateTime.of(2026, 9, 1, 12, 0));
        Movimiento segundo = movimiento(2L, leche, TipoMovimiento.ENTRADA, 4, 4,
                LocalDateTime.of(2026, 9, 1, 11, 0));
        Movimiento masAntiguo = movimiento(1L, arroz, TipoMovimiento.ENTRADA, 10, 10,
                LocalDateTime.of(2026, 9, 1, 10, 0));
        when(movimientoRepository.findAllByOrderByFechaDesc())
                .thenReturn(List.of(masReciente, segundo, masAntiguo));

        ReporteMovimientosResponse reporte = reporteService.generarReporteMovimientos();

        assertThat(reporte.getResumen().getTotalMovimientos()).isEqualTo(3);
        assertThat(reporte.getResumen().getTotalEntradas()).isEqualTo(2);
        assertThat(reporte.getResumen().getTotalSalidas()).isEqualTo(1);
        assertThat(reporte.getResumen().getUnidadesIngresadas()).isEqualTo(14);
        assertThat(reporte.getResumen().getUnidadesRetiradas()).isEqualTo(2);
        assertThat(reporte.getResumen().getBalanceUnidades()).isEqualTo(12);
        assertThat(reporte.getPorProducto()).extracting("nombre")
                .containsExactly("Arroz", "Leche");
        assertThat(reporte.getPorProducto().get(0).getTotalMovimientos()).isEqualTo(2);
        assertThat(reporte.getPorProducto().get(0).getBalanceUnidades()).isEqualTo(8);
        assertThat(reporte.getMovimientos()).extracting("id")
                .containsExactly(3L, 2L, 1L);
    }

    @Test
    void devuelveReporteDeMovimientosVacioSinExcepcion() {
        when(movimientoRepository.findAllByOrderByFechaDesc()).thenReturn(List.of());

        ReporteMovimientosResponse reporte = reporteService.generarReporteMovimientos();

        assertThat(reporte.getResumen().getTotalMovimientos()).isZero();
        assertThat(reporte.getResumen().getBalanceUnidades()).isZero();
        assertThat(reporte.getPorProducto()).isEmpty();
        assertThat(reporte.getMovimientos()).isEmpty();
    }

    private Producto producto(Long id, String codigo, String nombre,
                              int stockActual, int stockMinimo) {
        Producto producto = new Producto();
        Categoria categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNombre("Categoría");
        producto.setId(id);
        producto.setCodigo(codigo);
        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setUnidadMedida("Unidad");
        producto.setStockActual(stockActual);
        producto.setStockMinimo(stockMinimo);
        return producto;
    }

    private Movimiento movimiento(Long id, Producto producto, TipoMovimiento tipo,
                                  int cantidad, int stockResultante, LocalDateTime fecha) {
        Movimiento movimiento = new Movimiento();
        movimiento.setId(id);
        movimiento.setProducto(producto);
        movimiento.setTipo(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setStockResultante(stockResultante);
        movimiento.setFecha(fecha);
        movimiento.setObservacion("Prueba");
        return movimiento;
    }
}
