package com.budgetsdf.producto.controller;

import com.budgetsdf.producto.dto.request.ProductoRequest;
import com.budgetsdf.producto.dto.response.ProductoResponse;
import com.budgetsdf.producto.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crearProducto(
            @Valid @RequestBody ProductoRequest request) {

        ProductoResponse response = productoService.crearProducto(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarProductos() {

        List<ProductoResponse> productos = productoService.listarProductos();

        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> buscarProductoPorId(
            @PathVariable Long id) {

        ProductoResponse producto = productoService.buscarPorId(id);

        return ResponseEntity.ok(producto);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {

        ProductoResponse producto = productoService.actualizarProducto(id, request);

        return ResponseEntity.ok(producto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);

        return ResponseEntity.ok(
                Map.of("message", "Producto eliminado correctamente")
        );
    }
    
}
