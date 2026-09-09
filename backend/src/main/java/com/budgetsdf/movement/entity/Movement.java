package com.budgetsdf.movement.entity;

import com.budgetsdf.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Getter
@Setter
@NoArgsConstructor
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private MovementType type;

    @Column(name = "cantidad", nullable = false)
    private Integer quantity;

    @Column(name = "stock_resultante", nullable = false)
    private Integer resultingStock;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime date;

    @Column(name = "observacion")
    private String observation;
}
