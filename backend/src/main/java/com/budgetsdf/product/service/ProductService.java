package com.budgetsdf.product.service;

import com.budgetsdf.category.entity.Category;
import com.budgetsdf.category.repository.CategoryRepository;
import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.dto.request.ProductRequest;
import com.budgetsdf.product.dto.response.ProductResponse;
import com.budgetsdf.product.entity.Product;
import com.budgetsdf.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MovementRepository movementRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          MovementRepository movementRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.movementRepository = movementRepository;
    }

    public ProductResponse createProduct(ProductRequest request) {

        String code = request.getCode().trim();
        String name = request.getName().trim();
        String unitOfMeasure = request.getUnitOfMeasure().trim();

        if (productRepository.existsByCode(code)) {
            throw new BusinessException("Ya existe un producto con ese código");
        }

        Category category = findCategory(request.getCategoryId());

        Product product = new Product();

        product.setCode(code);
        product.setName(name);
        product.setCategory(category);
        product.setUnitOfMeasure(unitOfMeasure);
        product.setMinimumStock(request.getMinimumStock());
        product.setCurrentStock(0);

        Product savedProduct = productRepository.save(product);

        return convertToResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public ProductResponse findById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        return convertToResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        String code = request.getCode().trim();
        String name = request.getName().trim();
        String unitOfMeasure = request.getUnitOfMeasure().trim();

        if (!product.getCode().equals(code)
                && productRepository.existsByCode(code)) {
            throw new BusinessException("Ya existe un producto con ese código");
        }

        product.setCode(code);
        product.setName(name);
        product.setCategory(findCategory(request.getCategoryId()));
        product.setUnitOfMeasure(unitOfMeasure);
        product.setMinimumStock(request.getMinimumStock());

        Product updatedProduct = productRepository.save(product);

        return convertToResponse(updatedProduct);
    }

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (movementRepository.existsByProductId(id)) {
            throw new BusinessException(
                    "No se puede eliminar el producto porque tiene movimientos asociados"
            );
        }

        productRepository.delete(product);
    }

    private Category findCategory(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Categoría no encontrada"));
    }

    private ProductResponse convertToResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setCode(product.getCode());
        response.setName(product.getName());
        response.setCategoryId(product.getCategory().getId());
        response.setCategory(product.getCategory().getName());
        response.setUnitOfMeasure(product.getUnitOfMeasure());
        response.setCurrentStock(product.getCurrentStock());
        response.setMinimumStock(product.getMinimumStock());

        return response;
    }
}