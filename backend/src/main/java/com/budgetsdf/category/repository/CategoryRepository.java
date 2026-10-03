package com.budgetsdf.category.repository;

import com.budgetsdf.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Acceso JPA a las categorías y consultas derivadas por nombre.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Busca una categoría por nombre sin distinguir mayúsculas y minúsculas. */
    Optional<Category> findByNameIgnoreCase(String name);

    /** Comprueba si ya existe un nombre de categoría, ignorando mayúsculas. */
    boolean existsByNameIgnoreCase(String name);

    /** Recupera las categorías ordenadas ascendentemente por nombre. */
    List<Category> findAllByOrderByNameAsc();
}
