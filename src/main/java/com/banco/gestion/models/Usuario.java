package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entidad Usuario - Representa todos los usuarios del sistema
 * Implementa UserDetails para integración con Spring Security
 */
@Entity
@Table(name = "usuarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = "correo_electronico"),
    @UniqueConstraint(columnNames = "nombre_usuario")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Column(name = "nombre_usuario", unique = true, nullable = false)
    private String nombreUsuario;

    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String contrasena;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico debe ser válido")
    @Column(name = "correo_electronico", unique = true, nullable = false)
    private String correoElectronico;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[0-9]{7,15}$", message = "El teléfono debe tener entre 7 y 15 dígitos")
    @Column(nullable = false)
    private String telefono;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_sistema", nullable = false)
    private Enums.RolSistema rolSistema;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_usuario", nullable = false)
    private Enums.EstadoUsuario estadoUsuario = Enums.EstadoUsuario.ACTIVO;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @Column(name = "id_cliente_relacionado")
    private Long idClienteRelacionado;

    // ===== Métodos de UserDetails =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rolSistema.name()));
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return nombreUsuario;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return estadoUsuario != Enums.EstadoUsuario.BLOQUEADO;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return estadoUsuario == Enums.EstadoUsuario.ACTIVO;
    }

    /**
     * Valida que el usuario sea mayor de 18 años
     */
    public boolean esMayorDeEdad() {
        LocalDate hoy = LocalDate.now();
        return fechaNacimiento.plusYears(18).isBefore(hoy) || fechaNacimiento.plusYears(18).isEqual(hoy);
    }

    /**
     * Verifica si el usuario puede realizar operaciones
     */
    public boolean puedeOperar() {
        return estadoUsuario == Enums.EstadoUsuario.ACTIVO && esMayorDeEdad();
    }
}
