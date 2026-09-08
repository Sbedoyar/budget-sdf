package com.budgetsdf.movimiento.repository;

import com.budgetsdf.movimiento.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findAllByOrderByFechaDesc();

    List<Movimiento> findByProductoIdOrderByFechaDesc(Long productoId);

    boolean existsByProductoId(Long productoId);
}