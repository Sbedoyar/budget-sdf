package com.budgetsdf.report.service;

import com.budgetsdf.movement.entity.Movement;
import com.budgetsdf.movement.entity.MovementType;
import com.budgetsdf.movement.repository.MovementRepository;
import com.budgetsdf.product.entity.Product;
import com.budgetsdf.product.repository.ProductRepository;
import com.budgetsdf.report.dto.response.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private final ProductRepository productRepository;
    private final MovementRepository movementRepository;

    public ReportService(ProductRepository productRepository, MovementRepository movementRepository) {
        this.productRepository = productRepository;
        this.movementRepository = movementRepository;
    }

    public InventoryReportResponse generateInventoryReport() {
        List<Product> products = productRepository.findAll();

        List<InventoryProductResponse> productDetails = products.stream()
                .map(this::createProductDetail)
                .sorted(Comparator.comparing(InventoryProductResponse::getStockStatus)
                        .thenComparing(InventoryProductResponse::getName,
                                String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new InventoryReportResponse(
                createInventorySummary(productDetails),
                productDetails
        );
    }

    public MovementReportResponse generateMovementReport() {
        List<Movement> movements = movementRepository.findAllByOrderByDateDesc();

        List<MovementDetailResponse> movementDetails = movements.stream()
                .map(this::createMovementDetail)
                .toList();

        return new MovementReportResponse(
                createMovementSummary(movements),
                createProductSummary(movements),
                movementDetails
        );
    }

    private InventorySummaryResponse createInventorySummary(
            List<InventoryProductResponse> products) {
        long totalUnitsInStock = products.stream()
                .mapToLong(InventoryProductResponse::getCurrentStock)
                .sum();
        long outOfStock = countProductsByStatus(products, StockStatus.OUT_OF_STOCK);
        long lowStock = countProductsByStatus(products, StockStatus.LOW_STOCK);
        long normalStock = countProductsByStatus(products, StockStatus.NORMAL);

        return new InventorySummaryResponse(
                products.size(), totalUnitsInStock, lowStock, outOfStock, normalStock);
    }

    private long countProductsByStatus(List<InventoryProductResponse> products,
                                           StockStatus status) {
        return products.stream()
                .filter(product -> product.getStockStatus() == status)
                .count();
    }

    private InventoryProductResponse createProductDetail(Product product) {
        return new InventoryProductResponse(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getCategory().getName(),
                product.getUnitOfMeasure(),
                product.getCurrentStock(),
                product.getMinimumStock(),
                determineStockStatus(product)
        );
    }

    private StockStatus determineStockStatus(Product product) {
        if (product.getCurrentStock() == 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (product.getCurrentStock() <= product.getMinimumStock()) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.NORMAL;
    }

    private MovementSummaryResponse createMovementSummary(List<Movement> movements) {
        long totalInbound = countMovementsByType(movements, MovementType.ENTRADA);
        long totalOutbound = countMovementsByType(movements, MovementType.SALIDA);
        long inboundUnits = sumUnitsByType(movements, MovementType.ENTRADA);
        long outboundUnits = sumUnitsByType(movements, MovementType.SALIDA);

        return new MovementSummaryResponse(
                movements.size(), totalInbound, totalOutbound,
                inboundUnits, outboundUnits,
                inboundUnits - outboundUnits
        );
    }

    private List<ProductMovementSummaryResponse> createProductSummary(
            List<Movement> movements) {
        Map<Long, List<Movement>> movementsByProduct = movements.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        movement -> movement.getProduct().getId(), LinkedHashMap::new,
                        java.util.stream.Collectors.toList()));

        return movementsByProduct.values().stream()
                .map(this::createProductSummaryForMovements)
                .sorted(Comparator.comparing(ProductMovementSummaryResponse::getName,
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(ProductMovementSummaryResponse::getProductId))
                .toList();
    }

        private ProductMovementSummaryResponse createProductSummaryForMovements(List<Movement> movements) {
        Movement firstMovement = movements.get(0);
        Product product = firstMovement.getProduct();
        long inbound = countMovementsByType(movements, MovementType.ENTRADA);
        long outbound = countMovementsByType(movements, MovementType.SALIDA);
        long inboundUnits = sumUnitsByType(movements, MovementType.ENTRADA);
        long outboundUnits = sumUnitsByType(movements, MovementType.SALIDA);

        return new ProductMovementSummaryResponse(
                product.getId(), product.getCode(), product.getName(),
                movements.size(), inbound, outbound,
                inboundUnits, outboundUnits,
                inboundUnits - outboundUnits
        );
    }

    private long countMovementsByType(List<Movement> movements, MovementType type) {
        return movements.stream()
                .filter(movement -> movement.getType() == type)
                .count();
    }

    private long sumUnitsByType(List<Movement> movements, MovementType type) {
        return movements.stream()
                .filter(movement -> movement.getType() == type)
                .mapToLong(Movement::getQuantity)
                .sum();
    }

    private MovementDetailResponse createMovementDetail(Movement movement) {
        Product product = movement.getProduct();
        return new MovementDetailResponse(
                movement.getId(),
                product.getId(),
                product.getCode(),
                product.getName(),
                movement.getType(),
                movement.getQuantity(),
                movement.getResultingStock(),
                movement.getDate(),
                movement.getObservation()
        );
    }
}
