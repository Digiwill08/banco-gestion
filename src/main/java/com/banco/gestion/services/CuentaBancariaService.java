package com.banco.gestion.services;

import com.banco.gestion.models.CuentaBancaria;
import com.banco.gestion.models.Cliente;
import com.banco.gestion.repositories.CuentaBancariaRepository;
import com.banco.gestion.repositories.ClienteRepository;
import com.banco.gestion.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de Cuentas Bancarias
 * Gestiona la creación, actualización y operaciones en cuentas
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CuentaBancariaService {

    private final CuentaBancariaRepository cuentaRepository;
    private final ClienteRepository clienteRepository;
    private final BitacoraService bitacoraService;

    /**
     * Crear una nueva cuenta bancaria
     * Regla: No se puede abrir cuenta a cliente con Estado_Usuario = 'Inactivo' o 'Bloqueado'
     */
    public CuentaBancaria crearCuenta(CuentaBancaria cuenta) {
        // Validar que el cliente exista y esté activo
        Cliente cliente = clienteRepository.findById(cuenta.getIdTitular())
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));

        if (cliente.getEstadoCliente() != Enums.EstadoUsuario.ACTIVO) {
            throw new IllegalArgumentException("No se puede abrir cuenta a cliente inactivo o bloqueado");
        }

        // Generar número de cuenta único
        cuenta.setNumeroCuenta(generarNumeroCuenta());
        cuenta.setFechaApertura(LocalDate.now());
        cuenta.setEstadoCuenta(Enums.EstadoCuenta.ACTIVA);
        cuenta.setSaldoActual(BigDecimal.ZERO);

        CuentaBancaria cuentaGuardada = cuentaRepository.save(cuenta);

        // Registrar en bitácora
        bitacoraService.registrarAperturaCuenta(cuentaGuardada);

        return cuentaGuardada;
    }

    /**
     * Obtener cuenta por número
     */
    public Optional<CuentaBancaria> obtenerPorNumero(String numeroCuenta) {
        return cuentaRepository.findByNumeroCuenta(numeroCuenta);
    }

    /**
     * Obtener cuentas de un cliente
     */
    public List<CuentaBancaria> obtenerCuentasCliente(Long idTitular) {
        return cuentaRepository.findByIdTitular(idTitular);
    }

    /**
     * Obtener cuentas activas de un cliente
     */
    public List<CuentaBancaria> obtenerCuentasActivasCliente(Long idTitular) {
        return cuentaRepository.findByIdTitularAndEstadoCuenta(idTitular, Enums.EstadoCuenta.ACTIVA);
    }

    /**
     * Bloquear cuenta
     */
    public CuentaBancaria bloquearCuenta(Long idCuenta) {
        CuentaBancaria cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));
        cuenta.setEstadoCuenta(Enums.EstadoCuenta.BLOQUEADA);
        cuenta.setFechaActualizacion(LocalDateTime.now());
        return cuentaRepository.save(cuenta);
    }

    /**
     * Cancelar cuenta
     */
    public CuentaBancaria cancelarCuenta(Long idCuenta) {
        CuentaBancaria cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));
        
        if (cuenta.getSaldoActual().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("No se puede cancelar cuenta con saldo disponible");
        }
        
        cuenta.setEstadoCuenta(Enums.EstadoCuenta.CANCELADA);
        cuenta.setFechaActualizacion(LocalDateTime.now());
        return cuentaRepository.save(cuenta);
    }

    /**
     * Aumentar saldo (depósito)
     */
    public CuentaBancaria depositar(Long idCuenta, BigDecimal monto) {
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        CuentaBancaria cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));

        if (!cuenta.estaDisponibleParaOperaciones()) {
            throw new IllegalArgumentException("La cuenta no está disponible para operaciones");
        }

        BigDecimal saldoAnterior = cuenta.getSaldoActual();
        cuenta.setSaldoActual(cuenta.getSaldoActual().add(monto));
        cuenta.setFechaActualizacion(LocalDateTime.now());

        return cuentaRepository.save(cuenta);
    }

    /**
     * Disminuir saldo (retiro)
     */
    public CuentaBancaria retirar(Long idCuenta, BigDecimal monto) {
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        CuentaBancaria cuenta = cuentaRepository.findById(idCuenta)
            .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));

        if (!cuenta.estaDisponibleParaOperaciones()) {
            throw new IllegalArgumentException("La cuenta no está disponible para operaciones");
        }

        if (!cuenta.tieneSaldoSuficiente(monto)) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar el retiro");
        }

        cuenta.setSaldoActual(cuenta.getSaldoActual().subtract(monto));
        cuenta.setFechaActualizacion(LocalDateTime.now());

        return cuentaRepository.save(cuenta);
    }

    /**
     * Validar que cuenta esté disponible para operaciones
     */
    public boolean estaDisponible(String numeroCuenta) {
        Optional<CuentaBancaria> cuenta = cuentaRepository.findByNumeroCuenta(numeroCuenta);
        return cuenta.isPresent() && cuenta.get().estaDisponibleParaOperaciones();
    }

    /**
     * Validar saldo suficiente
     */
    public boolean tieneSaldoSuficiente(String numeroCuenta, BigDecimal monto) {
        Optional<CuentaBancaria> cuenta = cuentaRepository.findByNumeroCuenta(numeroCuenta);
        return cuenta.isPresent() && cuenta.get().tieneSaldoSuficiente(monto);
    }

    /**
     * Generar número de cuenta único
     */
    private String generarNumeroCuenta() {
        String numeroCuenta;
        do {
            numeroCuenta = "CTA" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (cuentaRepository.findByNumeroCuenta(numeroCuenta).isPresent());
        return numeroCuenta;
    }

    /**
     * Obtener todas las cuentas
     */
    public List<CuentaBancaria> obtenerTodas() {
        return cuentaRepository.findAll();
    }
}
