package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad ProductoBancario (Catálogo)
 */
@Entity
@Table(name = "productos_bancarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo_producto")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoBancario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @NotBlank(message = "El código del producto es obligatorio")
    @Column(name = "codigo_producto", unique = true, nullable = false)
    private String codigoProducto;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(name = "nombre_producto", nullable = false)
    private String nombreProducto;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private Enums.CategoriaProducto categoria;

    @Column(name = "requiere_aprobacion", nullable = false)
    private Boolean requiereAprobacion = false;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
