package com.banco.gestion.services;

import com.banco.gestion.models.Usuario;
import com.banco.gestion.repositories.UsuarioRepository;
import com.banco.gestion.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de Usuarios
 * Gestiona la creación, actualización y consulta de usuarios
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Crear un nuevo usuario
     */
    public Usuario crearUsuario(Usuario usuario) {
        // Validar que sea mayor de 18 años
        if (!usuario.esMayorDeEdad()) {
            throw new IllegalArgumentException("El usuario debe ser mayor de 18 años");
        }

        // Encriptar contraseña
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        return usuarioRepository.save(usuario);
    }

    /**
     * Obtener usuario por nombre de usuario
     */
    public Optional<Usuario> obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }

    /**
     * Obtener usuario por correo electrónico
     */
    public Optional<Usuario> obtenerPorCorreo(String correoElectronico) {
        return usuarioRepository.findByCorreoElectronico(correoElectronico);
    }

    /**
     * Obtener usuario por ID
     */
    public Optional<Usuario> obtenerPorId(Long idUsuario) {
        return usuarioRepository.findById(idUsuario);
    }

    /**
     * Listar usuarios por rol
     */
    public List<Usuario> listarPorRol(Enums.RolSistema rolSistema) {
        return usuarioRepository.findByRolSistema(rolSistema);
    }

    /**
     * Listar usuarios por estado
     */
    public List<Usuario> listarPorEstado(Enums.EstadoUsuario estadoUsuario) {
        return usuarioRepository.findByEstadoUsuario(estadoUsuario);
    }

    /**
     * Cambiar estado de usuario
     */
    public Usuario cambiarEstado(Long idUsuario, Enums.EstadoUsuario nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setEstadoUsuario(nuevoEstado);
        return usuarioRepository.save(usuario);
    }

    /**
     * Cambiar contraseña
     */
    public Usuario cambiarContrasena(Long idUsuario, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        return usuarioRepository.save(usuario);
    }

    /**
     * Validar que el usuario pueda operar
     */
    public boolean puedeOperar(Long idUsuario) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        return usuario.isPresent() && usuario.get().puedeOperar();
    }

    /**
     * Validar acceso por rol
     */
    public boolean tieneRol(Long idUsuario, Enums.RolSistema rolRequerido) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        return usuario.isPresent() && usuario.get().getRolSistema() == rolRequerido;
    }

    /**
     * Validar acceso por múltiples roles
     */
    public boolean tieneAlgunRol(Long idUsuario, Enums.RolSistema... rolesPermitidos) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        if (usuario.isEmpty()) {
            return false;
        }
        for (Enums.RolSistema rol : rolesPermitidos) {
            if (usuario.get().getRolSistema() == rol) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtener todos los usuarios
     */
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    /**
     * Eliminar usuario (cambiar a estado INACTIVO)
     */
    public void desactivarUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setEstadoUsuario(Enums.EstadoUsuario.INACTIVO);
        usuarioRepository.save(usuario);
    }
}
