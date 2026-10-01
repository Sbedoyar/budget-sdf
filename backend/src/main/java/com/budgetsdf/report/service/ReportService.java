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

/**
 * Construye reportes agregados de existencias y movimientos a partir de los datos persistidos.
 */
@Service
public class ReportService {
    private final ProductRepository productRepository;
    private final MovementRepository movementRepository;

    public ReportService(ProductRepository productRepository, MovementRepository movementRepository) {
        this.productRepository = productRepository;
        this.movementRepository = movementRepository;
    }

    /**
     * Genera el detalle de productos y los totales por estado de stock.
     *
     * @return reporte general del inventario
     */
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

    /**
     * Genera el resumen global, el desglose por producto y el detalle de movimientos.
     *
     * @return reporte de actividad del inventario
     */
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

    /** Resume cantidades y número de productos para cada estado del stock. */
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

    /** Cuenta productos cuyo estado coincide con el indicado. */
    private long countProductsByStatus(List<InventoryProductResponse> products,
                                           StockStatus status) {
        return products.stream()
                .filter(product -> product.getStockStatus() == status)
                .count();
    }

    /** Convierte una entidad de producto en el detalle usado por el reporte. */
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

    /** Clasifica el producto como agotado, bajo o normal según sus niveles actuales. */
    private StockStatus determineStockStatus(Product product) {
        if (product.getCurrentStock() == 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (product.getCurrentStock() <= product.getMinimumStock()) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.NORMAL;
    }

    /** Calcula cantidades de movimientos, unidades y balance global. */
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

    /** Agrupa los movimientos por producto y ordena sus resúmenes por nombre e identificador. */
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

        /** Calcula los totales de entrada, salida y balance para un producto. */
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

    /** Cuenta los movimientos que pertenecen al tipo indicado. */
    private long countMovementsByType(List<Movement> movements, MovementType type) {
        return movements.stream()
                .filter(movement -> movement.getType() == type)
                .count();
    }

    /** Suma las unidades registradas para el tipo de movimiento indicado. */
    private long sumUnitsByType(List<Movement> movements, MovementType type) {
        return movements.stream()
                .filter(movement -> movement.getType() == type)
                .mapToLong(Movement::getQuantity)
                .sum();
    }

    /** Convierte un movimiento persistido en una fila detallada del reporte. */
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
