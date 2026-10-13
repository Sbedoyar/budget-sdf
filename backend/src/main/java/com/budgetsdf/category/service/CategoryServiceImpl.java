package com.budgetsdf.category.service;

import com.budgetsdf.category.dto.request.CategoryRequest;
import com.budgetsdf.category.dto.response.CategoryResponse;
import com.budgetsdf.category.entity.Category;
import com.budgetsdf.category.repository.CategoryRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Aplica las reglas de negocio para crear, consultar, actualizar y eliminar categorías.
 */
@Service("categoryService")
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(
            CategoryRepository categoryRepository,
            ProductRepository productRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    /**
     * Crea una categoría después de normalizar y comprobar que su nombre sea único.
     *
     * @param request datos validados de la categoría
     * @return representación de la categoría creada
     */
    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = normalizeName(request.getName());

        // La comparación sin distinguir mayúsculas evita nombres duplicados por formato.
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }

        Category category = new Category();
        category.setName(name);
        return convertToResponse(categoryRepository.save(category));
    }

    /**
     * Recupera todas las categorías ordenadas alfabéticamente.
     *
     * @return categorías preparadas para la respuesta de la API
     */
    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Busca una categoría por su identificador.
     *
     * @param id identificador de la categoría
     * @return categoría encontrada
     * @throws BusinessException si no existe la categoría
     */
    @Override
    public CategoryResponse findById(Long id) {
        return convertToResponse(findCategory(id));
    }

    /**
     * Actualiza el nombre de una categoría y conserva la unicidad frente a otras categorías.
     *
     * @param id identificador de la categoría que se actualizará
     * @param request nuevos datos de la categoría
     * @return representación actualizada
     */
    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        String name = normalizeName(request.getName());

        validateUniqueName(name, id);

        category.setName(name);
        return convertToResponse(categoryRepository.save(category));
    }

    /**
     * Elimina una categoría únicamente cuando ningún producto la utiliza.
     *
     * @param id identificador de la categoría que se eliminará
     * @throws BusinessException si no existe o tiene productos asociados
     */
    @Transactional
    @Override
    public void deleteCategory(Long id) {
        Category category = findCategory(id);

        // Se conserva la integridad de las referencias entre productos y categorías.
        if (productRepository.existsByCategoryId(id)) {
            throw new BusinessException(
                    "No se puede eliminar la categoría porque tiene productos asociados"
            );
        }

        categoryRepository.delete(category);
    }

    private void validateUniqueName(String name, Long currentCategoryId) {
        Category existingCategory = categoryRepository
                .findByNameIgnoreCase(name)
                .orElse(null);

        if (existingCategory == null) {
            return;
        }

        if (!existingCategory.getId().equals(currentCategoryId)) {
            throw new BusinessException(
                    "Ya existe una categoría con ese nombre"
            );
        }
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("Categoría no encontrada")
                );
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException(
                    "El nombre de la categoría es obligatorio"
            );
        }

        return name.trim();
    }

    private CategoryResponse convertToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName()
        );
    }
}
