package com.budgetsdf.product.service;

import com.budgetsdf.category.entity.Category;
import com.budgetsdf.category.repository.CategoryRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.dto.request.ProductRequest;
import com.budgetsdf.product.dto.response.ProductResponse;
import com.budgetsdf.product.entity.Product;
import com.budgetsdf.product.repository.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductServiceTests {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private MovementRepository movementRepository;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        movementRepository = mock(MovementRepository.class);

        productService = new ProductService(
                productRepository,
                categoryRepository,
                movementRepository
        );
    }

    @Test
    void createsProductWithExistingCategory() {
        Category category = category(1L, "Bebidas");
        configureCreation(category);

        productService.createProduct(request(1L));

        verify(productRepository).save(
                org.mockito.ArgumentMatchers.argThat(
                        product -> product.getCategory() == category
                )
        );
    }

    @Test
    void rejectsMissingCategoryOnCreate() {
        ProductRequest request = request(99L);

        when(productRepository.existsByCode(request.getCode())).thenReturn(false);
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Categoría no encontrada");

        verify(productRepository, never()).save(any());
    }

    @Test
    void updatesCategoryWithoutChangingCurrentStock() {
        Category previousCategory = category(1L, "Bebidas");
        Category newCategory = category(2L, "Granos");

        Product product = product(5L, previousCategory, 12);

        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(newCategory));
        when(productRepository.save(product)).thenReturn(product);

        ProductRequest request = request(2L);

        ProductResponse response =
                productService.updateProduct(5L, request);

        assertThat(response.getCategoryId()).isEqualTo(2L);
        assertThat(response.getCategory()).isEqualTo("Granos");
        assertThat(response.getCurrentStock()).isEqualTo(12);
    }

    @Test
    void responseReturnsCategoryIdAndName() {
        Category category = category(7L, "Aseo");

        Product product = product(10L, category, 4);

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(product));

        ProductResponse response =
                productService.findById(10L);

        assertThat(response.getCategoryId()).isEqualTo(7L);
        assertThat(response.getCategory()).isEqualTo("Aseo");
    }

    @Test
    void newProductKeepsInitialStockAtZero() {
        configureCreation(category(1L, "Bebidas"));

        ProductResponse response =
                productService.createProduct(request(1L));

        assertThat(response.getCurrentStock()).isZero();
    }

    private void configureCreation(Category category) {

        when(productRepository.existsByCode("P001"))
                .thenReturn(false);

        when(categoryRepository.findById(category.getId()))
                .thenReturn(Optional.of(category));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> {
                    Product product = invocation.getArgument(0);
                    product.setId(1L);
                    return product;
                });
    }

    private ProductRequest request(Long categoryId) {

        ProductRequest request = new ProductRequest();

        request.setCode("P001");
        request.setName("Coca Cola 1.5L");
        request.setCategoryId(categoryId);
        request.setUnitOfMeasure("Unidad");
        request.setMinimumStock(5);

        return request;
    }

    private Category category(Long id, String name) {

        Category category = new Category();

        category.setId(id);
        category.setName(name);

        return category;
    }

    private Product product(Long id,
                              Category category,
                              int currentStock) {

        Product product = new Product();

        product.setId(id);
        product.setCode("P001");
        product.setName("Producto");
        product.setCategory(category);
        product.setUnitOfMeasure("Unidad");
        product.setCurrentStock(currentStock);
        product.setMinimumStock(5);

        return product;
    }
}
