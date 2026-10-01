package com.budgetsdf.product.controller;

import com.budgetsdf.product.dto.request.ProductRequest;
import com.budgetsdf.product.dto.response.ProductResponse;
import com.budgetsdf.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Expone las operaciones HTTP del catálogo de productos.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Registra un producto con los datos validados del cuerpo.
     *
     * @param request datos del producto
     * @return producto creado con estado HTTP 201
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Lista todos los productos del inventario.
     *
     * @return catálogo de productos
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<ProductResponse> products = productService.getAllProducts();

        return ResponseEntity.ok(products);
    }

    /**
     * Consulta un producto por su identificador.
     *
     * @param id identificador del producto recibido en la ruta
     * @return producto encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findProductById(
            @PathVariable Long id) {

        ProductResponse product = productService.findById(id);

        return ResponseEntity.ok(product);
    }
    /**
     * Actualiza los datos de un producto existente.
     *
     * @param id identificador del producto recibido en la ruta
     * @param request nuevos datos validados
     * @return producto actualizado
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse product = productService.updateProduct(id, request);

        return ResponseEntity.ok(product);
    }

    /**
     * Elimina un producto que no tenga movimientos asociados.
     *
     * @param id identificador del producto recibido en la ruta
     * @return mensaje de confirmación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);

        return ResponseEntity.ok(
                Map.of("message", "Producto eliminado correctamente")
        );
    }
}
