package com.budgetsdf.product.entity;

import com.budgetsdf.category.entity.Category;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad que representa un producto y sus niveles actuales y mínimos de inventario.
 */
@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true)
    private String code;

    @Column(name = "nombre", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Category category;

    @Column(name = "unidad_medida", nullable = false)
    private String unitOfMeasure;

    @Column(name = "stock_actual", nullable = false)
    private Integer currentStock = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer minimumStock = 0;

    @Column(name = "activo", nullable = false)
    private Boolean active = true;
}
