package com.banco.gestion.repositories;

import com.banco.gestion.models.Usuario;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Usuario
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    Optional<Usuario> findByCorreoElectronico(String correoElectronico);
    List<Usuario> findByRolSistema(Enums.RolSistema rolSistema);
    List<Usuario> findByEstadoUsuario(Enums.EstadoUsuario estadoUsuario);
    List<Usuario> findByIdClienteRelacionado(Long idClienteRelacionado);
}
