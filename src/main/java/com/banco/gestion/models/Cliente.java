package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Clase base abstracta para clientes
 */
@Entity
@Table(name = "clientes")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

    @NotBlank(message = "El número de identificación es obligatorio")
    @Column(name = "numero_identificacion", unique = true, nullable = false)
    private String numeroIdentificacion;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico debe ser válido")
    @Column(nullable = false)
    private String correoElectronico;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[0-9]{7,15}$", message = "El teléfono debe tener entre 7 y 15 dígitos")
    @Column(nullable = false)
    private String telefono;

    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_cliente", nullable = false)
    private Enums.EstadoUsuario estadoCliente = Enums.EstadoUsuario.ACTIVO;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    public abstract String getTipoCliente();
}

/**
 * Cliente Persona Natural
 */
@Entity
@DiscriminatorValue("PERSONA_NATURAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
class ClientePersonaNatural extends Cliente {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Override
    public String getTipoCliente() {
        return "PERSONA_NATURAL";
    }

    /**
     * Valida que sea mayor de 18 años
     */
    public boolean esMayorDeEdad() {
        LocalDate hoy = LocalDate.now();
        return fechaNacimiento.plusYears(18).isBefore(hoy) || fechaNacimiento.plusYears(18).isEqual(hoy);
    }
}

/**
 * Cliente Empresa
 */
@Entity
@DiscriminatorValue("EMPRESA")
@Data
@NoArgsConstructor
@AllArgsConstructor
class ClienteEmpresa extends Cliente {

    @NotBlank(message = "La razón social es obligatoria")
    @Column(name = "razon_social", nullable = false)
    private String razonSocial;

    @NotBlank(message = "El NIT es obligatorio")
    @Column(name = "nit", unique = true, nullable = false)
    private String nit;

    @Column(name = "representante_legal_id")
    private Long representanteLegalId;

    @Override
    public String getTipoCliente() {
        return "EMPRESA";
    }
}
