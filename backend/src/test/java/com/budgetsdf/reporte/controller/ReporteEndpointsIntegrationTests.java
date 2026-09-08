package com.budgetsdf.reporte.controller;

import com.budgetsdf.categoria.dto.request.CategoriaRequest;
import com.budgetsdf.categoria.repository.CategoriaRepository;
import com.jayway.jsonpath.JsonPath;
import com.budgetsdf.movimiento.dto.request.MovimientoRequest;
import com.budgetsdf.movimiento.entity.TipoMovimiento;
import com.budgetsdf.movimiento.repository.MovimientoRepository;
import com.budgetsdf.producto.dto.request.ProductoRequest;
import com.budgetsdf.producto.repository.ProductoRepository;
import com.budgetsdf.usuario.dto.request.LoginRequest;
import com.budgetsdf.usuario.entity.RolUsuario;
import com.budgetsdf.usuario.entity.Usuario;
import com.budgetsdf.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "app.jwt.secret=budget-sdf-integration-test-secret-32-characters",
        "spring.jpa.hibernate.ddl-auto=validate",
        "server.port=0"
    }
)
class ReporteEndpointsIntegrationTests {
    private static final String PASSWORD = "Reporte-Temporal-2026";

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MovimientoRepository movimientoRepository;

    private Usuario usuarioTemporal;
    private RestClient restClient;
    private Long categoriaTemporalId;
    private Long productoTemporalId;
    private final List<Long> movimientosTemporalesIds = new ArrayList<>();

    @BeforeEach
    void prepararUsuarioYCliente() {
        usuarioTemporal = new Usuario();
        usuarioTemporal.setUsername("reporte_test_" + UUID.randomUUID());
        usuarioTemporal.setPassword(passwordEncoder.encode(PASSWORD));
        usuarioTemporal.setRol(RolUsuario.PROPIETARIO);
        usuarioTemporal = usuarioRepository.save(usuarioTemporal);
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    @AfterEach
    void eliminarDatosTemporales() {
        movimientosTemporalesIds.forEach(id -> {
            if (movimientoRepository.existsById(id)) {
                movimientoRepository.deleteById(id);
            }
        });
        movimientosTemporalesIds.clear();
        if (productoTemporalId != null && productoRepository.existsById(productoTemporalId)) {
            productoRepository.deleteById(productoTemporalId);
        }
        if (categoriaTemporalId != null && categoriaRepository.existsById(categoriaTemporalId)) {
            categoriaRepository.deleteById(categoriaTemporalId);
        }
        if (usuarioTemporal != null && usuarioTemporal.getId() != null) {
            usuarioRepository.deleteById(usuarioTemporal.getId());
        }
    }

    @Test
    void consultaAmbosReportesConJwtValido() {
        String token = iniciarSesion();

        String inventarioJson = restClient.get()
                .uri("/api/reportes/inventario")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        String movimientosJson = restClient.get()
                .uri("/api/reportes/movimientos")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        Number totalProductos = JsonPath.read(inventarioJson, "$.resumen.totalProductos");
        Number sinStock = JsonPath.read(inventarioJson, "$.resumen.productosSinStock");
        Number bajoStock = JsonPath.read(inventarioJson, "$.resumen.productosConBajoStock");
        Number stockNormal = JsonPath.read(inventarioJson, "$.resumen.productosConStockNormal");
        List<?> productos = JsonPath.read(inventarioJson, "$.productos");
        assertThat(totalProductos.longValue()).isEqualTo(productos.size());
        assertThat(totalProductos.longValue()).isEqualTo(
                sinStock.longValue() + bajoStock.longValue() + stockNormal.longValue());

        Number totalMovimientos = JsonPath.read(movimientosJson, "$.resumen.totalMovimientos");
        Number totalEntradas = JsonPath.read(movimientosJson, "$.resumen.totalEntradas");
        Number totalSalidas = JsonPath.read(movimientosJson, "$.resumen.totalSalidas");
        Number unidadesIngresadas = JsonPath.read(movimientosJson, "$.resumen.unidadesIngresadas");
        Number unidadesRetiradas = JsonPath.read(movimientosJson, "$.resumen.unidadesRetiradas");
        Number balance = JsonPath.read(movimientosJson, "$.resumen.balanceUnidades");
        List<?> detalleMovimientos = JsonPath.read(movimientosJson, "$.movimientos");
        assertThat(totalMovimientos.longValue()).isEqualTo(detalleMovimientos.size());
        assertThat(totalMovimientos.longValue())
                .isEqualTo(totalEntradas.longValue() + totalSalidas.longValue());
        assertThat(balance.longValue())
                .isEqualTo(unidadesIngresadas.longValue() - unidadesRetiradas.longValue());
    }

    @Test
    void completaFlujoAutenticadoConCategoriaProductoMovimientosAlertasYReportes() {
        String token = iniciarSesion();
        String sufijo = UUID.randomUUID().toString().substring(0, 8);

        CategoriaRequest categoriaRequest = new CategoriaRequest();
        categoriaRequest.setNombre("Bebidas integración " + sufijo);
        ResponseEntity<String> categoriaResponse = restClient.post()
                .uri("/api/categorias")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(categoriaRequest)
                .retrieve()
                .toEntity(String.class);
        assertThat(categoriaResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        categoriaTemporalId = ((Number) JsonPath.read(
                categoriaResponse.getBody(), "$.id")).longValue();

        ProductoRequest productoRequest = new ProductoRequest();
        productoRequest.setCodigo("INT-" + sufijo);
        productoRequest.setNombre("Producto integración");
        productoRequest.setCategoriaId(categoriaTemporalId);
        productoRequest.setUnidadMedida("Unidad");
        productoRequest.setStockMinimo(5);
        ResponseEntity<String> productoResponse = restClient.post()
                .uri("/api/productos")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(productoRequest)
                .retrieve()
                .toEntity(String.class);
        assertThat(productoResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        productoTemporalId = ((Number) JsonPath.read(
                productoResponse.getBody(), "$.id")).longValue();
        assertThat(((Number) JsonPath.read(productoResponse.getBody(), "$.categoriaId")).longValue())
                .isEqualTo(categoriaTemporalId);
        assertThat(JsonPath.<String>read(productoResponse.getBody(), "$.categoria"))
                .isEqualTo(categoriaRequest.getNombre());

        registrarMovimiento(token, TipoMovimiento.ENTRADA, 4);
        registrarMovimiento(token, TipoMovimiento.SALIDA, 1);

        String productoJson = restClient.get()
                .uri("/api/productos/{id}", productoTemporalId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        assertThat(((Number) JsonPath.read(productoJson, "$.stockActual")).intValue()).isEqualTo(3);
        assertThat(((Number) JsonPath.read(productoJson, "$.categoriaId")).longValue())
                .isEqualTo(categoriaTemporalId);

        String alertasJson = restClient.get()
                .uri("/api/alertas/bajo-stock")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<Number> productosEnAlerta = JsonPath.read(alertasJson, "$[*].productoId");
        assertThat(productosEnAlerta.stream().map(Number::longValue))
                .contains(productoTemporalId);

        String inventarioJson = restClient.get()
                .uri("/api/reportes/inventario")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<String> categoriasEnReporte = JsonPath.read(inventarioJson,
                "$.productos[?(@.productoId == " + productoTemporalId + ")].categoria");
        assertThat(categoriasEnReporte).containsExactly(categoriaRequest.getNombre());

        String movimientosJson = restClient.get()
                .uri("/api/reportes/movimientos")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<Number> productosEnMovimientos = JsonPath.read(
                movimientosJson, "$.movimientos[*].productoId");
        assertThat(productosEnMovimientos.stream().map(Number::longValue))
                .contains(productoTemporalId);
    }

    private String iniciarSesion() {
        LoginRequest request = new LoginRequest();
        request.setUsername(usuarioTemporal.getUsername());
        request.setPassword(PASSWORD);

        String loginJson = restClient.post()
                .uri("/api/auth/login")
                .body(request)
                .retrieve()
                .body(String.class);

        String token = JsonPath.read(loginJson, "$.token");
        assertThat(token).isNotBlank();
        return token;
    }

    private void registrarMovimiento(String token, TipoMovimiento tipo, int cantidad) {
        MovimientoRequest request = new MovimientoRequest();
        request.setProductoId(productoTemporalId);
        request.setTipo(tipo);
        request.setCantidad(cantidad);
        request.setObservacion("Prueba de integración");

        ResponseEntity<String> response = restClient.post()
                .uri("/api/movimientos")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(request)
                .retrieve()
                .toEntity(String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        movimientosTemporalesIds.add(((Number) JsonPath.read(response.getBody(), "$.id")).longValue());
    }
}
