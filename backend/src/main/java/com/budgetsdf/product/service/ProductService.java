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

/**
 * Gestiona el catálogo de productos y sus reglas de integridad.
 */
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

    /**
     * Crea un producto con stock inicial en cero y una categoría existente.
     *
     * @param request datos validados del producto
     * @return producto creado en formato de respuesta
     * @throws BusinessException si el código ya existe o la categoría no existe
     */
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

    /**
     * Recupera el catálogo completo de productos.
     *
     * @return productos convertidos al formato de respuesta
     */
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Busca un producto por su identificador.
     *
     * @param id identificador del producto
     * @return producto encontrado
     * @throws BusinessException si el producto no existe
     */
    public ProductResponse findById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        return convertToResponse(product);
    }

    /**
     * Actualiza los datos descriptivos y la categoría de un producto existente.
     *
     * @param id identificador del producto
     * @param request nuevos datos validados del producto
     * @return producto actualizado
     * @throws BusinessException si el producto, el código único o la categoría no son válidos
     */
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

    /**
     * Elimina un producto solo si no tiene movimientos de inventario registrados.
     *
     * @param id identificador del producto
     * @throws BusinessException si el producto no existe o tiene movimientos asociados
     */
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        // El historial de movimientos depende del producto y no debe quedar sin referencia.
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