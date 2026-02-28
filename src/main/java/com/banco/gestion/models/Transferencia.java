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
 * Entidad Transferencia
 */
@Entity
@Table(name = "transferencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transferencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTransferencia;

    @NotBlank(message = "La cuenta origen es obligatoria")
    @Column(name = "cuenta_origen", nullable = false)
    private String cuentaOrigen;

    @NotBlank(message = "La cuenta destino es obligatoria")
    @Column(name = "cuenta_destino", nullable = false)
    private String cuentaDestino;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01")
    @Column(name = "monto", nullable = false)
    private BigDecimal monto;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_transferencia", nullable = false)
    private Enums.EstadoTransferencia estadoTransferencia = Enums.EstadoTransferencia.EJECUTADA;

    @NotNull(message = "El ID del usuario creador es obligatorio")
    @Column(name = "id_usuario_creador", nullable = false)
    private Long idUsuarioCreador;

    @Column(name = "id_usuario_aprobador")
    private Long idUsuarioAprobador;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    /**
     * Calcula si la transferencia ha vencido (más de 1 hora en espera)
     */
    public boolean haVencido() {
        if (estadoTransferencia != Enums.EstadoTransferencia.EN_ESPERA_DE_APROBACION) {
            return false;
        }
        LocalDateTime ahora = LocalDateTime.now();
        return fechaCreacion.plusHours(1).isBefore(ahora);
    }

    /**
     * Valida que pueda ser ejecutada
     */
    public boolean puedeSerEjecutada() {
        return estadoTransferencia == Enums.EstadoTransferencia.EN_ESPERA_DE_APROBACION ||
               estadoTransferencia == Enums.EstadoTransferencia.EJECUTADA;
    }
}
