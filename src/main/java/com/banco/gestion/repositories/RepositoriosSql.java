package com.banco.gestion.repositories;

import com.banco.gestion.models.*;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

/**
 * Repositorio para Cliente
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNumeroIdentificacion(String numeroIdentificacion);
    List<Cliente> findByEstadoCliente(Enums.EstadoUsuario estadoCliente);
}

/**
 * Repositorio para CuentaBancaria
 */
@Repository
public interface CuentaBancariaRepository extends JpaRepository<CuentaBancaria, Long> {
    Optional<CuentaBancaria> findByNumeroCuenta(String numeroCuenta);
    List<CuentaBancaria> findByIdTitular(Long idTitular);
    List<CuentaBancaria> findByEstadoCuenta(Enums.EstadoCuenta estadoCuenta);
    List<CuentaBancaria> findByIdTitularAndEstadoCuenta(Long idTitular, Enums.EstadoCuenta estadoCuenta);
}

/**
 * Repositorio para Préstamo
 */
@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    List<Prestamo> findByIdClienteSolicitante(Long idClienteSolicitante);
    List<Prestamo> findByEstadoPrestamo(Enums.EstadoPrestamo estadoPrestamo);
    List<Prestamo> findByIdAnalistaAprobador(Long idAnalistaAprobador);

    @Query("SELECT p FROM Prestamo p WHERE p.estadoPrestamo = 'EN_ESTUDIO' ORDER BY p.fechaCreacion ASC")
    List<Prestamo> findPrestamosEnEstudio();
}

/**
 * Repositorio para Transferencia
 */
@Repository
public interface TransferenciaRepository extends JpaRepository<Transferencia, Long> {
    List<Transferencia> findByCuentaOrigen(String cuentaOrigen);
    List<Transferencia> findByCuentaDestino(String cuentaDestino);
    List<Transferencia> findByEstadoTransferencia(Enums.EstadoTransferencia estadoTransferencia);
    List<Transferencia> findByIdUsuarioCreador(Long idUsuarioCreador);
    List<Transferencia> findByIdUsuarioAprobador(Long idUsuarioAprobador);

    @Query("SELECT t FROM Transferencia t WHERE t.estadoTransferencia = 'EN_ESPERA_DE_APROBACION' AND t.fechaCreacion < CURRENT_TIMESTAMP - INTERVAL 1 HOUR")
    List<Transferencia> findTransferenciasVencidas();
}

/**
 * Repositorio para ProductoBancario
 */
@Repository
public interface ProductoBancarioRepository extends JpaRepository<ProductoBancario, Long> {
    Optional<ProductoBancario> findByCodigoProducto(String codigoProducto);
    List<ProductoBancario> findByCategoria(Enums.CategoriaProducto categoria);
    List<ProductoBancario> findByRequiereAprobacion(Boolean requiereAprobacion);
}
