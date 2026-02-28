package com.banco.gestion.repositories;

import com.banco.gestion.models.Cliente;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Cliente
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNumeroIdentificacion(String numeroIdentificacion);
    List<Cliente> findByEstadoCliente(Enums.EstadoUsuario estadoCliente);
}
