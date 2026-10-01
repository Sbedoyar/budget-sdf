package com.budgetsdf.product.repository;

import com.budgetsdf.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Operaciones de persistencia y consultas específicas para productos.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Busca un producto por su código único. */
    Optional<Product> findByCode(String code);

    /** Comprueba si un código ya está registrado. */
    boolean existsByCode(String code);

    /** Comprueba si una categoría tiene productos asociados. */
    boolean existsByCategoryId(Long categoryId);
}
