package com.budgetsdf.movement.repository;

import com.budgetsdf.movement.entity.Movement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {

    List<Movement> findAllByOrderByDateDesc();

    List<Movement> findByProductIdOrderByDateDesc(Long productId);

    boolean existsByProductId(Long productId);
}
