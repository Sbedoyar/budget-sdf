package com.budgetsdf.category.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.category.dto.request.CategoryRequest;
import com.budgetsdf.category.dto.response.CategoryResponse;

import java.util.List;

/** Contrato de las operaciones del servicio de categorías. */
public interface CategoryService {

    /**
     * Crea una categoría después de normalizar y comprobar que su nombre sea único.
     *
     * @param request datos validados de la categoría
     * @return representación de la categoría creada
     */
    CategoryResponse createCategory(CategoryRequest request);

    /**
     * Recupera todas las categorías ordenadas alfabéticamente.
     *
     * @return categorías preparadas para la respuesta de la API
     */
    List<CategoryResponse> getAllCategories();

    /**
     * Busca una categoría por su identificador.
     *
     * @param id identificador de la categoría
     * @return categoría encontrada
     * @throws BusinessException si no existe la categoría
     */
    CategoryResponse findById(Long id);

    /**
     * Actualiza el nombre de una categoría y conserva la unicidad frente a otras categorías.
     *
     * @param id identificador de la categoría que se actualizará
     * @param request nuevos datos de la categoría
     * @return representación actualizada
     */
    CategoryResponse updateCategory(Long id, CategoryRequest request);

    /**
     * Elimina una categoría únicamente cuando ningún producto la utiliza.
     *
     * @param id identificador de la categoría que se eliminará
     * @throws BusinessException si no existe o tiene productos asociados
     */
    void deleteCategory(Long id);
}
