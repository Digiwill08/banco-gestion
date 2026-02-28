package com.banco.gestion.repositories;

import com.banco.gestion.models.CuentaBancaria;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
