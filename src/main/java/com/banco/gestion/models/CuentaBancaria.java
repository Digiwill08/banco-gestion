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
