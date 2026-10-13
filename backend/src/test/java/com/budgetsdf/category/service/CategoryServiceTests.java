package com.budgetsdf.category.service;

import com.budgetsdf.category.dto.request.CategoryRequest;
import com.budgetsdf.category.dto.response.CategoryResponse;
import com.budgetsdf.category.entity.Category;
import com.budgetsdf.category.repository.CategoryRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoryServiceTests {
    private CategoryRepository categoryRepository;
    private ProductRepository productRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        productRepository = mock(ProductRepository.class);
        categoryService = new CategoryServiceImpl(categoryRepository, productRepository);
    }

    @Test
    void createsCategoryApplyingTrim() {
        CategoryRequest request = request("  Bebidas  ");
        when(categoryRepository.existsByNameIgnoreCase("Bebidas")).thenReturn(false);
        when(categoryRepository.save(org.mockito.ArgumentMatchers.any(Category.class)))
                .thenAnswer(invocation -> {
                    Category category = invocation.getArgument(0);
                    category.setId(1L);
                    return category;
                });

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Bebidas");
    }

    @Test
    void preventsDuplicateCategoryIgnoringCase() {
        CategoryRequest request = request("bebidas");
        when(categoryRepository.existsByNameIgnoreCase("bebidas")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Ya existe una categoría con ese nombre");
        verify(categoryRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void reportsWhenCategoryDoesNotExist() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById(99L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Categoría no encontrada");
    }

    @Test
    void updatesCategoryAndAppliesTrim() {
        Category category = category(1L, "Bebidas");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByNameIgnoreCase("Alimentos")).thenReturn(Optional.empty());
        when(categoryRepository.save(category)).thenReturn(category);

        CategoryResponse response = categoryService.updateCategory(
                1L, request("  Alimentos "));

        assertThat(response.getName()).isEqualTo("Alimentos");
    }

    @Test
    void preventsDeletingCategoryWithProducts() {
        Category category = category(1L, "Bebidas");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("No se puede eliminar la categoría porque tiene productos asociados");
        verify(categoryRepository, never()).delete(category);
    }

    @Test
    void deletesCategoryWithoutProducts() {
        Category category = category(2L, "Granos");
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(2L)).thenReturn(false);

        categoryService.deleteCategory(2L);

        verify(categoryRepository).delete(category);
    }

    private CategoryRequest request(String name) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        return request;
    }

    private Category category(Long id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        return category;
    }
}
