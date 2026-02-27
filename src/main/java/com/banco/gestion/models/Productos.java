package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad CuentaBancaria
 */
@Entity
@Table(name = "cuentas_bancarias", uniqueConstraints = {
    @UniqueConstraint(columnNames = "numero_cuenta")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCuenta;

    @NotBlank(message = "El número de cuenta es obligatorio")
    @Column(name = "numero_cuenta", unique = true, nullable = false)
    private String numeroCuenta;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", nullable = false)
    private Enums.TipoCuenta tipoCuenta;

    @NotNull(message = "El ID del titular es obligatorio")
    @Column(name = "id_titular", nullable = false)
    private Long idTitular;

    @NotNull(message = "El saldo es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "saldo_actual", nullable = false)
    private BigDecimal saldoActual = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false)
    private Enums.Moneda moneda = Enums.Moneda.COP;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_cuenta", nullable = false)
    private Enums.EstadoCuenta estadoCuenta = Enums.EstadoCuenta.ACTIVA;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura = LocalDate.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    /**
     * Valida que la cuenta esté activa y disponible para operaciones
     */
    public boolean estaDisponibleParaOperaciones() {
        return estadoCuenta == Enums.EstadoCuenta.ACTIVA;
    }

    /**
     * Valida que tenga saldo suficiente
     */
    public boolean tieneSaldoSuficiente(BigDecimal monto) {
        return saldoActual.compareTo(monto) >= 0;
    }
}

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
