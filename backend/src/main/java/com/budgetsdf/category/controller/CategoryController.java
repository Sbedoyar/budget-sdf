package com.budgetsdf.category.controller;

import com.budgetsdf.category.dto.request.CategoryRequest;
import com.budgetsdf.category.dto.response.CategoryResponse;
import com.budgetsdf.category.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Recibe las solicitudes HTTP de categorías y delega su procesamiento al servicio.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Registra una categoría a partir de los datos validados del cuerpo.
     *
     * @param request datos de la categoría
     * @return categoría creada con estado HTTP 201
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request));
    }

    /**
     * Lista las categorías disponibles.
     *
     * @return categorías ordenadas por nombre
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Consulta una categoría por su identificador.
     *
     * @param id identificador recibido en la ruta
     * @return categoría encontrada
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    /**
     * Actualiza una categoría existente con los datos validados recibidos.
     *
     * @param id identificador recibido en la ruta
     * @param request nuevos datos de la categoría
     * @return categoría actualizada
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        return ResponseEntity.ok(
                categoryService.updateCategory(id, request)
        );
    }

    /**
     * Elimina una categoría si no tiene productos asociados.
     *
     * @param id identificador recibido en la ruta
     * @return mensaje de confirmación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(
            @PathVariable Long id) {

        categoryService.deleteCategory(id);

        return ResponseEntity.ok(
                Map.of("message", "Categoría eliminada correctamente")
        );
    }
}