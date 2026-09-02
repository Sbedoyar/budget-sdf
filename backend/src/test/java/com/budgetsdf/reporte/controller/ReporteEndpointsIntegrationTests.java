package com.budgetsdf.reporte.controller;

import com.jayway.jsonpath.JsonPath;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

import java.util.UUID;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.jwt.secret=budget-sdf-integration-test-secret-32-characters"
)
class ReporteEndpointsIntegrationTests {
    private static final String PASSWORD = "Reporte-Temporal-2026";

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario usuarioTemporal;
    private RestClient restClient;

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
    void eliminarUsuarioTemporal() {
        if (usuarioTemporal != null && usuarioTemporal.getId() != null) {
            usuarioRepository.deleteById(usuarioTemporal.getId());
        }
    }

    @Test
    void consultaAmbosReportesConJwtValido() {
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
}
