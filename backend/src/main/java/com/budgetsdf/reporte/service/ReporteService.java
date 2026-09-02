package com.budgetsdf.reporte.service;

import com.budgetsdf.movimiento.entity.Movimiento;
import com.budgetsdf.movimiento.entity.TipoMovimiento;
import com.budgetsdf.movimiento.repository.MovimientoRepository;
import com.budgetsdf.producto.entity.Producto;
import com.budgetsdf.producto.repository.ProductoRepository;
import com.budgetsdf.reporte.dto.response.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReporteService {
    private final ProductoRepository productoRepository;
    private final MovimientoRepository movimientoRepository;

    public ReporteService(ProductoRepository productoRepository, MovimientoRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public ReporteInventarioResponse generarReporteInventario() {
        List<Producto> productos = productoRepository.findAll();

        List<ProductoInventarioResponse> detalleProductos = productos.stream()
                .map(this::crearDetalleProducto)
                .sorted(Comparator.comparing(ProductoInventarioResponse::getEstadoStock)
                        .thenComparing(ProductoInventarioResponse::getNombre,
                                String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new ReporteInventarioResponse(
                crearResumenInventario(detalleProductos),
                detalleProductos
        );
    }

    public ReporteMovimientosResponse generarReporteMovimientos() {
        List<Movimiento> movimientos = movimientoRepository.findAllByOrderByFechaDesc();

        List<MovimientoDetalleResponse> detalleMovimientos = movimientos.stream()
                .map(this::crearDetalleMovimiento)
                .toList();

        return new ReporteMovimientosResponse(
                crearResumenMovimientos(movimientos),
                crearResumenPorProducto(movimientos),
                detalleMovimientos
        );
    }

    private ResumenInventarioResponse crearResumenInventario(
            List<ProductoInventarioResponse> productos) {
        long totalUnidades = productos.stream()
                .mapToLong(ProductoInventarioResponse::getStockActual)
                .sum();
        long sinStock = contarProductosPorEstado(productos, EstadoStock.SIN_STOCK);
        long bajoStock = contarProductosPorEstado(productos, EstadoStock.BAJO_STOCK);
        long stockNormal = contarProductosPorEstado(productos, EstadoStock.NORMAL);

        return new ResumenInventarioResponse(
                productos.size(), totalUnidades, bajoStock, sinStock, stockNormal);
    }

    private long contarProductosPorEstado(List<ProductoInventarioResponse> productos,
                                           EstadoStock estado) {
        return productos.stream()
                .filter(producto -> producto.getEstadoStock() == estado)
                .count();
    }

    private ProductoInventarioResponse crearDetalleProducto(Producto producto) {
        return new ProductoInventarioResponse(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getCategoria(),
                producto.getUnidadMedida(),
                producto.getStockActual(),
                producto.getStockMinimo(),
                determinarEstadoStock(producto)
        );
    }

    private EstadoStock determinarEstadoStock(Producto producto) {
        if (producto.getStockActual() == 0) {
            return EstadoStock.SIN_STOCK;
        }
        if (producto.getStockActual() <= producto.getStockMinimo()) {
            return EstadoStock.BAJO_STOCK;
        }
        return EstadoStock.NORMAL;
    }

    private ResumenMovimientosResponse crearResumenMovimientos(List<Movimiento> movimientos) {
        long totalEntradas = contarMovimientosPorTipo(movimientos, TipoMovimiento.ENTRADA);
        long totalSalidas = contarMovimientosPorTipo(movimientos, TipoMovimiento.SALIDA);
        long unidadesIngresadas = sumarUnidadesPorTipo(movimientos, TipoMovimiento.ENTRADA);
        long unidadesRetiradas = sumarUnidadesPorTipo(movimientos, TipoMovimiento.SALIDA);

        return new ResumenMovimientosResponse(
                movimientos.size(), totalEntradas, totalSalidas,
                unidadesIngresadas, unidadesRetiradas,
                unidadesIngresadas - unidadesRetiradas
        );
    }

    private List<MovimientoPorProductoResponse> crearResumenPorProducto(
            List<Movimiento> movimientos) {
        Map<Long, List<Movimiento>> movimientosAgrupados = movimientos.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        movimiento -> movimiento.getProducto().getId(), LinkedHashMap::new,
                        java.util.stream.Collectors.toList()));

        return movimientosAgrupados.values().stream()
                .map(this::crearResumenDeProducto)
                .sorted(Comparator.comparing(MovimientoPorProductoResponse::getNombre,
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(MovimientoPorProductoResponse::getProductoId))
                .toList();
    }

    private MovimientoPorProductoResponse crearResumenDeProducto(List<Movimiento> movimientos) {
        Movimiento primerMovimiento = movimientos.get(0);
        Producto producto = primerMovimiento.getProducto();
        long entradas = contarMovimientosPorTipo(movimientos, TipoMovimiento.ENTRADA);
        long salidas = contarMovimientosPorTipo(movimientos, TipoMovimiento.SALIDA);
        long unidadesIngresadas = sumarUnidadesPorTipo(movimientos, TipoMovimiento.ENTRADA);
        long unidadesRetiradas = sumarUnidadesPorTipo(movimientos, TipoMovimiento.SALIDA);

        return new MovimientoPorProductoResponse(
                producto.getId(), producto.getCodigo(), producto.getNombre(),
                movimientos.size(), entradas, salidas,
                unidadesIngresadas, unidadesRetiradas,
                unidadesIngresadas - unidadesRetiradas
        );
    }

    private long contarMovimientosPorTipo(List<Movimiento> movimientos, TipoMovimiento tipo) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getTipo() == tipo)
                .count();
    }

    private long sumarUnidadesPorTipo(List<Movimiento> movimientos, TipoMovimiento tipo) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getTipo() == tipo)
                .mapToLong(Movimiento::getCantidad)
                .sum();
    }

    private MovimientoDetalleResponse crearDetalleMovimiento(Movimiento movimiento) {
        Producto producto = movimiento.getProducto();
        return new MovimientoDetalleResponse(
                movimiento.getId(),
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                movimiento.getTipo(),
                movimiento.getCantidad(),
                movimiento.getStockResultante(),
                movimiento.getFecha(),
                movimiento.getObservacion()
        );
    }
}
