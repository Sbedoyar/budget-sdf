package com.budgetsdf.movimiento.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movimiento.dto.request.MovimientoRequest;
import com.budgetsdf.movimiento.dto.response.MovimientoResponse;
import com.budgetsdf.movimiento.entity.Movimiento;
import com.budgetsdf.movimiento.entity.TipoMovimiento;
import com.budgetsdf.movimiento.repository.MovimientoRepository;
import com.budgetsdf.producto.entity.Producto;
import com.budgetsdf.producto.repository.ProductoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    public MovimientoService(
            MovimientoRepository movimientoRepository,
            ProductoRepository productoRepository) {

        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public MovimientoResponse registrarMovimiento(MovimientoRequest request) {

        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (request.getTipo() == TipoMovimiento.ENTRADA) {

            producto.setStockActual(
                    producto.getStockActual() + request.getCantidad()
            );

        } else if (request.getTipo() == TipoMovimiento.SALIDA) {

            if (producto.getStockActual() < request.getCantidad()) {
                throw new BusinessException("Stock insuficiente");
            }

            producto.setStockActual(
                    producto.getStockActual() - request.getCantidad()
            );
        }

        productoRepository.save(producto);

        Movimiento movimiento = new Movimiento();

        movimiento.setProducto(producto);
        movimiento.setTipo(request.getTipo());
        movimiento.setCantidad(request.getCantidad());
        movimiento.setStockResultante(producto.getStockActual());
        movimiento.setFecha(LocalDateTime.now());
        movimiento.setObservacion(request.getObservacion());

        Movimiento movimientoGuardado =
                movimientoRepository.save(movimiento);

        MovimientoResponse response = new MovimientoResponse();

        response.setId(movimientoGuardado.getId());
        response.setProductoId(producto.getId());
        response.setProductoNombre(producto.getNombre());
        response.setTipo(movimientoGuardado.getTipo());
        response.setCantidad(movimientoGuardado.getCantidad());
        response.setFecha(movimientoGuardado.getFecha());
        response.setObservacion(movimientoGuardado.getObservacion());
        response.setStockResultante(movimientoGuardado.getStockResultante());

        return response;
    }
    public List<MovimientoResponse> listarMovimientos() {

        return movimientoRepository.findAllByOrderByFechaDesc()
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    public List<MovimientoResponse> listarMovimientosPorProducto(Long productoId) {

        if (!productoRepository.existsById(productoId)) {
            throw new BusinessException("Producto no encontrado");
        }

        return movimientoRepository
                .findByProductoIdOrderByFechaDesc(productoId)
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }
    private MovimientoResponse convertirAResponse(Movimiento movimiento) {

        MovimientoResponse response = new MovimientoResponse();

        response.setId(movimiento.getId());
        response.setProductoId(movimiento.getProducto().getId());
        response.setProductoNombre(movimiento.getProducto().getNombre());
        response.setTipo(movimiento.getTipo());
        response.setCantidad(movimiento.getCantidad());
        response.setFecha(movimiento.getFecha());
        response.setObservacion(movimiento.getObservacion());
        response.setStockResultante(movimiento.getStockResultante());

        return response;
    }
}