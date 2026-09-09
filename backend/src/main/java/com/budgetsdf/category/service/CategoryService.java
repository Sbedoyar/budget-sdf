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

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository,
                            ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        String name = normalizeName(request.getName());
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }

        Category category = new Category();
        category.setName(name);
        return convertToResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::convertToResponse)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        return convertToResponse(findCategory(id));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);
        String name = normalizeName(request.getName());

        categoryRepository.findByNameIgnoreCase(name)
                .filter(existingCategory -> !existingCategory.getId().equals(id))
                .ifPresent(existingCategory -> {
                    throw new BusinessException("Ya existe una categoría con ese nombre");
                });

        category.setName(name);
        return convertToResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new BusinessException(
                    "No se puede eliminar la categoría porque tiene productos asociados");
        }
        categoryRepository.delete(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Categoría no encontrada"));
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException("El nombre de la categoría es obligatorio");
        }
        return name.trim();
    }

    private CategoryResponse convertToResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
