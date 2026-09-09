package com.budgetsdf.report.controller;

import com.budgetsdf.category.dto.request.CategoryRequest;
import com.budgetsdf.category.repository.CategoryRepository;
import com.jayway.jsonpath.JsonPath;
import com.budgetsdf.movement.dto.request.MovementRequest;
import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.dto.request.ProductRequest;
import com.budgetsdf.product.repository.ProductRepository;
import com.budgetsdf.user.dto.request.LoginRequest;
import com.budgetsdf.user.entity.UserRole;
import com.budgetsdf.user.entity.User;
import com.budgetsdf.user.repository.UserRepository;
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
class ReportEndpointsIntegrationTests {
    private static final String PASSWORD = "Reporte-Temporal-2026";

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MovementRepository movementRepository;

    private User temporaryUser;
    private RestClient restClient;
    private Long temporaryCategoryId;
    private Long temporaryProductId;
    private final List<Long> temporaryMovementIds = new ArrayList<>();

    @BeforeEach
    void setUpUserAndClient() {
        temporaryUser = new User();
        temporaryUser.setUsername("reporte_test_" + UUID.randomUUID());
        temporaryUser.setPassword(passwordEncoder.encode(PASSWORD));
        temporaryUser.setRole(UserRole.PROPIETARIO);
        temporaryUser = userRepository.save(temporaryUser);
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    @AfterEach
    void cleanUpTemporaryData() {
        temporaryMovementIds.forEach(id -> {
            if (movementRepository.existsById(id)) {
                movementRepository.deleteById(id);
            }
        });
        temporaryMovementIds.clear();
        if (temporaryProductId != null && productRepository.existsById(temporaryProductId)) {
            productRepository.deleteById(temporaryProductId);
        }
        if (temporaryCategoryId != null && categoryRepository.existsById(temporaryCategoryId)) {
            categoryRepository.deleteById(temporaryCategoryId);
        }
        if (temporaryUser != null && temporaryUser.getId() != null) {
            userRepository.deleteById(temporaryUser.getId());
        }
    }

    @Test
    void retrievesBothReportsWithValidJwt() {
        String token = login();

        String inventoryJson = restClient.get()
                .uri("/api/reports/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        String movementsJson = restClient.get()
                .uri("/api/reports/movements")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        Number totalProducts = JsonPath.read(inventoryJson, "$.summary.totalProducts");
        Number outOfStock = JsonPath.read(inventoryJson, "$.summary.productsOutOfStock");
        Number lowStock = JsonPath.read(inventoryJson, "$.summary.productsWithLowStock");
        Number normalStock = JsonPath.read(inventoryJson, "$.summary.productsWithNormalStock");
        List<?> products = JsonPath.read(inventoryJson, "$.products");
        assertThat(totalProducts.longValue()).isEqualTo(products.size());
        assertThat(totalProducts.longValue()).isEqualTo(
                outOfStock.longValue() + lowStock.longValue() + normalStock.longValue());

        Number totalMovements = JsonPath.read(movementsJson, "$.summary.totalMovements");
        Number totalInbound = JsonPath.read(movementsJson, "$.summary.totalInbound");
        Number totalOutbound = JsonPath.read(movementsJson, "$.summary.totalOutbound");
        Number inboundUnits = JsonPath.read(movementsJson, "$.summary.inboundUnits");
        Number outboundUnits = JsonPath.read(movementsJson, "$.summary.outboundUnits");
        Number balance = JsonPath.read(movementsJson, "$.summary.unitBalance");
        List<?> movementDetails = JsonPath.read(movementsJson, "$.movements");
        assertThat(totalMovements.longValue()).isEqualTo(movementDetails.size());
        assertThat(totalMovements.longValue())
                .isEqualTo(totalInbound.longValue() + totalOutbound.longValue());
        assertThat(balance.longValue())
                .isEqualTo(inboundUnits.longValue() - outboundUnits.longValue());
    }

    @Test
    void completesAuthenticatedFlowWithCategoryProductMovementsAlertsAndReports() {
        String token = login();
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        CategoryRequest categoryRequest = new CategoryRequest();
        categoryRequest.setName("Bebidas integracion " + suffix);
        ResponseEntity<String> categoryResponse = restClient.post()
                .uri("/api/categories")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(categoryRequest)
                .retrieve()
                .toEntity(String.class);
        assertThat(categoryResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        temporaryCategoryId = ((Number) JsonPath.read(
                categoryResponse.getBody(), "$.id")).longValue();

        ProductRequest productRequest = new ProductRequest();
        productRequest.setCode("INT-" + suffix);
        productRequest.setName("Producto integracion");
        productRequest.setCategoryId(temporaryCategoryId);
        productRequest.setUnitOfMeasure("Unidad");
        productRequest.setMinimumStock(5);
        ResponseEntity<String> productResponse = restClient.post()
                .uri("/api/products")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(productRequest)
                .retrieve()
                .toEntity(String.class);
        assertThat(productResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        temporaryProductId = ((Number) JsonPath.read(
                productResponse.getBody(), "$.id")).longValue();
        assertThat(((Number) JsonPath.read(productResponse.getBody(), "$.categoryId")).longValue())
                .isEqualTo(temporaryCategoryId);
        assertThat(JsonPath.<String>read(productResponse.getBody(), "$.category"))
                .isEqualTo(categoryRequest.getName());

        recordMovement(token, MovementType.ENTRADA, 4);
        recordMovement(token, MovementType.SALIDA, 1);

        String productJson = restClient.get()
                .uri("/api/products/{id}", temporaryProductId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        assertThat(((Number) JsonPath.read(productJson, "$.currentStock")).intValue()).isEqualTo(3);
        assertThat(((Number) JsonPath.read(productJson, "$.categoryId")).longValue())
                .isEqualTo(temporaryCategoryId);

        String alertsJson = restClient.get()
                .uri("/api/alerts/low-stock")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<Number> productsInAlert = JsonPath.read(alertsJson, "$[*].productId");
        assertThat(productsInAlert.stream().map(Number::longValue))
                .contains(temporaryProductId);

        String inventoryJson = restClient.get()
                .uri("/api/reports/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<String> categoriesInReport = JsonPath.read(inventoryJson,
                "$.products[?(@.productId == " + temporaryProductId + ")].category");
        assertThat(categoriesInReport).containsExactly(categoryRequest.getName());

        String movementsJson = restClient.get()
                .uri("/api/reports/movements")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        List<Number> productsInMovements = JsonPath.read(
                movementsJson, "$.movements[*].productId");
        assertThat(productsInMovements.stream().map(Number::longValue))
                .contains(temporaryProductId);
    }

        private String login() {
        LoginRequest request = new LoginRequest();
        request.setUsername(temporaryUser.getUsername());
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

    private void recordMovement(String token, MovementType type, int quantity) {
        MovementRequest request = new MovementRequest();
        request.setProductId(temporaryProductId);
        request.setType(type);
        request.setQuantity(quantity);
        request.setObservation("Prueba de integracion");

        ResponseEntity<String> response = restClient.post()
                .uri("/api/movements")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(request)
                .retrieve()
                .toEntity(String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        temporaryMovementIds.add(((Number) JsonPath.read(response.getBody(), "$.id")).longValue());
    }
}
