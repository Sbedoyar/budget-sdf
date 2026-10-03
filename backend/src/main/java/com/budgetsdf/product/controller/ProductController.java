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
     * Lista los productos activos y, opcionalmente, también los inactivos.
     *
     * @param includeInactive indica si deben incluirse productos inactivos
     * @return catálogo de productos
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "false") boolean includeInactive) {

        List<ProductResponse> products =
                productService.getAllProducts(includeInactive);

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
     * Elimina físicamente un producto sin historial o lo desactiva cuando
     * tiene movimientos asociados.
     *
     * @param id identificador del producto recibido en la ruta
     * @return mensaje de confirmación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable Long id) {

        String message = productService.deleteProduct(id);

        return ResponseEntity.ok(
                Map.of("message", message)
        );
    }

    /**
     * Reactiva un producto previamente desactivado.
     *
     * @param id identificador del producto recibido en la ruta
     * @return producto reactivado
     */
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<ProductResponse> reactivateProduct(
            @PathVariable Long id) {

        ProductResponse product = productService.reactivateProduct(id);

        return ResponseEntity.ok(product);
    }
}
