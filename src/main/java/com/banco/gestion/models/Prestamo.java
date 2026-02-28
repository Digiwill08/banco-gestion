package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad Préstamo
 */
@Entity
@Table(name = "prestamos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPrestamo;

    @NotBlank(message = "El tipo de préstamo es obligatorio")
    @Column(name = "tipo_prestamo", nullable = false)
    private String tipoPrestamo;

    @NotNull(message = "El ID del cliente solicitante es obligatorio")
    @Column(name = "id_cliente_solicitante", nullable = false)
    private Long idClienteSolicitante;

    @NotNull(message = "El monto solicitado es obligatorio")
    @DecimalMin(value = "0.01")
    @Column(name = "monto_solicitado", nullable = false)
    private BigDecimal montoSolicitado;

    @DecimalMin(value = "0.0")
    @Column(name = "monto_aprobado")
    private BigDecimal montoAprobado = BigDecimal.ZERO;

    @NotNull(message = "La tasa de interés es obligatoria")
    @DecimalMin(value = "0.0")
    @Column(name = "tasa_interes", nullable = false)
    private BigDecimal tasaInteres;

    @NotNull(message = "El plazo en meses es obligatorio")
    @Min(value = 1)
    @Column(name = "plazo_meses", nullable = false)
    private Integer plazoMeses;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_prestamo", nullable = false)
    private Enums.EstadoPrestamo estadoPrestamo = Enums.EstadoPrestamo.EN_ESTUDIO;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "fecha_desembolso")
    private LocalDateTime fechaDesembolso;

    @Column(name = "cuenta_destino_desembolso")
    private String cuentaDestinoDesembolso;

    @Column(name = "id_analista_aprobador")
    private Long idAnalistaAprobador;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    /**
     * Valida que el préstamo pueda ser aprobado
     */
    public boolean puedeSerAprobado() {
        return estadoPrestamo == Enums.EstadoPrestamo.EN_ESTUDIO;
    }

    /**
     * Valida que el préstamo pueda ser desembolsado
     */
    public boolean puedeSerDesembolsado() {
        return estadoPrestamo == Enums.EstadoPrestamo.APROBADO && montoAprobado.compareTo(BigDecimal.ZERO) > 0;
    }
}
