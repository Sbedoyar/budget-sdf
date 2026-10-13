package com.budgetsdf.report.service;

import com.budgetsdf.category.entity.Category;
import com.budgetsdf.movement.entity.Movement;
import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.entity.Product;
import com.budgetsdf.product.repository.ProductRepository;
import com.budgetsdf.report.dto.response.InventoryReportResponse;
import com.budgetsdf.report.dto.response.MovementReportResponse;
import com.budgetsdf.report.dto.response.StockStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReportServiceTests {

    private ProductRepository productRepository;
    private MovementRepository movementRepository;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        movementRepository = mock(MovementRepository.class);

        reportService = new ReportServiceImpl(
                productRepository,
                movementRepository
        );
    }

    @Test
    void classifiesProductsWithoutDoubleCountingAndSortsByPriorityAndName() {
        Product normal = product(
                1L,
                "P001",
                "Café",
                6,
                5
        );

        Product atMinimumStock = product(
                2L,
                "P002",
                "Arroz",
                5,
                5
        );

        Product lowStockProduct = product(
                3L,
                "P003",
                "Azúcar",
                2,
                5
        );

        Product outOfStock = product(
                4L,
                "P004",
                "Leche",
                0,
                5
        );

        when(productRepository.findByActiveTrue())
                .thenReturn(
                        List.of(
                                normal,
                                atMinimumStock,
                                lowStockProduct,
                                outOfStock
                        )
                );

        InventoryReportResponse report =
                reportService.generateInventoryReport();

        assertThat(
                report.getSummary().getTotalProducts()
        ).isEqualTo(4);

        assertThat(
                report.getSummary().getTotalUnitsInStock()
        ).isEqualTo(13);

        assertThat(
                report.getSummary().getProductsOutOfStock()
        ).isEqualTo(1);

        assertThat(
                report.getSummary().getProductsWithLowStock()
        ).isEqualTo(2);

        assertThat(
                report.getSummary().getProductsWithNormalStock()
        ).isEqualTo(1);

        assertThat(report.getProducts())
                .extracting("stockStatus")
                .containsExactly(
                        StockStatus.OUT_OF_STOCK,
                        StockStatus.LOW_STOCK,
                        StockStatus.LOW_STOCK,
                        StockStatus.NORMAL
                );

        assertThat(report.getProducts())
                .extracting("name")
                .containsExactly(
                        "Leche",
                        "Arroz",
                        "Azúcar",
                        "Café"
                );
    }

    @Test
    void returnsEmptyInventoryWithoutException() {
        when(productRepository.findByActiveTrue())
                .thenReturn(List.of());

        InventoryReportResponse report =
                reportService.generateInventoryReport();

        assertThat(
                report.getSummary().getTotalProducts()
        ).isZero();

        assertThat(
                report.getSummary().getTotalUnitsInStock()
        ).isZero();

        assertThat(report.getProducts())
                .isEmpty();
    }

    @Test
    void calculatesAggregationsAndKeepsNewestHistoryFirst() {
        Product arroz = product(
                1L,
                "P001",
                "Arroz",
                8,
                3
        );

        Product leche = product(
                2L,
                "P002",
                "Leche",
                4,
                2
        );

        Movement mostRecent = movement(
                3L,
                arroz,
                MovementType.SALIDA,
                2,
                8,
                LocalDateTime.of(
                        2026,
                        9,
                        1,
                        12,
                        0
                )
        );

        Movement second = movement(
                2L,
                leche,
                MovementType.ENTRADA,
                4,
                4,
                LocalDateTime.of(
                        2026,
                        9,
                        1,
                        11,
                        0
                )
        );

        Movement oldest = movement(
                1L,
                arroz,
                MovementType.ENTRADA,
                10,
                10,
                LocalDateTime.of(
                        2026,
                        9,
                        1,
                        10,
                        0
                )
        );

        when(
                movementRepository.findForReport(
                        null,
                        null,
                        null
                )
        ).thenReturn(
                List.of(
                        mostRecent,
                        second,
                        oldest
                )
        );

        MovementReportResponse report =
                reportService.generateMovementReport();

        assertThat(
                report.getSummary().getTotalMovements()
        ).isEqualTo(3);

        assertThat(
                report.getSummary().getTotalInbound()
        ).isEqualTo(2);

        assertThat(
                report.getSummary().getTotalOutbound()
        ).isEqualTo(1);

        assertThat(
                report.getSummary().getInboundUnits()
        ).isEqualTo(14);

        assertThat(
                report.getSummary().getOutboundUnits()
        ).isEqualTo(2);

        assertThat(
                report.getSummary().getUnitBalance()
        ).isEqualTo(12);

        assertThat(report.getByProduct())
                .extracting("name")
                .containsExactly(
                        "Arroz",
                        "Leche"
                );

        assertThat(
                report.getByProduct()
                        .get(0)
                        .getTotalMovements()
        ).isEqualTo(2);

        assertThat(
                report.getByProduct()
                        .get(0)
                        .getUnitBalance()
        ).isEqualTo(8);

        assertThat(report.getMovements())
                .extracting("id")
                .containsExactly(
                        3L,
                        2L,
                        1L
                );
    }

    @Test
    void returnsEmptyMovementReportWithoutException() {
        when(
                movementRepository.findForReport(
                        null,
                        null,
                        null
                )
        ).thenReturn(List.of());

        MovementReportResponse report =
                reportService.generateMovementReport();

        assertThat(
                report.getSummary().getTotalMovements()
        ).isZero();

        assertThat(
                report.getSummary().getUnitBalance()
        ).isZero();

        assertThat(report.getByProduct())
                .isEmpty();

        assertThat(report.getMovements())
                .isEmpty();
    }

    private Product product(
            Long id,
            String code,
            String name,
            int currentStock,
            int minimumStock
    ) {

        Category category = new Category();
        category.setId(1L);
        category.setName("Categoría");

        Product product = new Product();
        product.setId(id);
        product.setCode(code);
        product.setName(name);
        product.setCategory(category);
        product.setUnitOfMeasure("Unidad");
        product.setCurrentStock(currentStock);
        product.setMinimumStock(minimumStock);
        product.setActive(true);

        return product;
    }

    private Movement movement(
            Long id,
            Product product,
            MovementType type,
            int quantity,
            int resultingStock,
            LocalDateTime date
    ) {

        Movement movement = new Movement();
        movement.setId(id);
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setResultingStock(resultingStock);
        movement.setDate(date);
        movement.setObservation("Prueba");

        return movement;
    }
}