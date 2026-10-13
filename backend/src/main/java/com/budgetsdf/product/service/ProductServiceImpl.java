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
@Service("productService")
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MovementRepository movementRepository;

    public ProductServiceImpl(ProductRepository productRepository,
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
    @Override
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
        product.setActive(true);

        Product savedProduct = productRepository.save(product);

        return convertToResponse(savedProduct);
    }

    /**
     * Recupera los productos del catálogo.
     *
     * @param includeInactive indica si también deben incluirse productos inactivos
     * @return productos convertidos al formato de respuesta
     */
    @Override
    public List<ProductResponse> getAllProducts(boolean includeInactive) {

        List<Product> products = includeInactive
                ? productRepository.findAll()
                : productRepository.findByActiveTrue();

        return products.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Busca un producto por su identificador, incluso si está inactivo.
     *
     * @param id identificador del producto
     * @return producto encontrado
     * @throws BusinessException si el producto no existe
     */
    @Override
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
    @Override
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
     * Elimina físicamente un producto sin historial o lo desactiva cuando
     * existen movimientos asociados que deben conservarse.
     *
     * @param id identificador del producto
     * @return mensaje que indica si el producto fue eliminado o desactivado
     * @throws BusinessException si el producto no existe o ya está inactivo
     */
    @Override
    public String deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (Boolean.FALSE.equals(product.getActive())) {
            throw new BusinessException("El producto ya está inactivo");
        }

        if (movementRepository.existsByProductId(id)) {
            product.setActive(false);
            productRepository.save(product);
            return "Producto desactivado correctamente. Su historial de movimientos se conserva";
        }

        productRepository.delete(product);
        return "Producto eliminado correctamente";
    }

    /**
     * Reactiva un producto previamente desactivado para permitir nuevamente
     * su uso en operaciones de inventario.
     *
     * @param id identificador del producto
     * @return producto reactivado
     * @throws BusinessException si el producto no existe o ya está activo
     */
    @Override
    public ProductResponse reactivateProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Producto no encontrado"));

        if (Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException("El producto ya está activo");
        }

        product.setActive(true);

        Product reactivatedProduct = productRepository.save(product);

        return convertToResponse(reactivatedProduct);
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
        response.setActive(product.getActive());

        return response;
    }
}
