package com.banco.gestion.services;

import com.banco.gestion.models.BitacoraOperacion;
import com.banco.gestion.models.CuentaBancaria;
import com.banco.gestion.models.Prestamo;
import com.banco.gestion.models.Transferencia;
import com.banco.gestion.repositories.BitacoraRepository;
import com.banco.gestion.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de Bitácora
 * Registra todas las operaciones significativas del sistema en MongoDB
 * Propósito: Auditoría, trazabilidad y cumplimiento normativo
 */
@Service
@RequiredArgsConstructor
public class BitacoraService {

    private final BitacoraRepository bitacoraRepository;

    /**
     * Registrar apertura de cuenta
     */
    public void registrarAperturaCuenta(CuentaBancaria cuenta) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("numero_cuenta", cuenta.getNumeroCuenta());
        detalles.put("tipo_cuenta", cuenta.getTipoCuenta().name());
        detalles.put("id_titular", cuenta.getIdTitular());
        detalles.put("saldo_inicial", cuenta.getSaldoActual());
        detalles.put("moneda", cuenta.getMoneda().name());

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.APERTURA_CUENTA,
            null,
            "SISTEMA",
            cuenta.getNumeroCuenta(),
            detalles,
            "Apertura de nueva cuenta bancaria"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar bloqueo de cuenta
     */
    public void registrarBloqueoCuenta(CuentaBancaria cuenta, Long idUsuario, String rolUsuario) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("numero_cuenta", cuenta.getNumeroCuenta());
        detalles.put("saldo_actual", cuenta.getSaldoActual());

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.BLOQUEO_CUENTA,
            idUsuario,
            rolUsuario,
            cuenta.getNumeroCuenta(),
            detalles,
            "Bloqueo de cuenta bancaria"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar cancelación de cuenta
     */
    public void registrarCancelacionCuenta(CuentaBancaria cuenta, Long idUsuario, String rolUsuario) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("numero_cuenta", cuenta.getNumeroCuenta());
        detalles.put("saldo_final", cuenta.getSaldoActual());

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.CANCELACION_CUENTA,
            idUsuario,
            rolUsuario,
            cuenta.getNumeroCuenta(),
            detalles,
            "Cancelación de cuenta bancaria"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar transferencia ejecutada
     */
    public void registrarTransferenciaEjecutada(Transferencia transferencia, 
                                                BigDecimal saldoAntesOrigen, 
                                                BigDecimal saldoDespuesOrigen,
                                                BigDecimal saldoAntesDestino,
                                                BigDecimal saldoDespuesDestino,
                                                String rolUsuario) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("monto_involucrado", transferencia.getMonto());
        detalles.put("saldo_antes_origen", saldoAntesOrigen);
        detalles.put("saldo_despues_origen", saldoDespuesOrigen);
        detalles.put("saldo_antes_destino", saldoAntesDestino);
        detalles.put("saldo_despues_destino", saldoDespuesDestino);
        detalles.put("cuenta_origen", transferencia.getCuentaOrigen());
        detalles.put("cuenta_destino", transferencia.getCuentaDestino());

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.TRANSFERENCIA_EJECUTADA,
            transferencia.getIdUsuarioCreador(),
            rolUsuario,
            transferencia.getIdTransferencia().toString(),
            detalles,
            "Transferencia ejecutada exitosamente"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar rechazo de transferencia
     */
    public void registrarTransferenciaRechazada(Transferencia transferencia, String razonRechazo, String rolUsuario) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("monto", transferencia.getMonto());
        detalles.put("cuenta_origen", transferencia.getCuentaOrigen());
        detalles.put("cuenta_destino", transferencia.getCuentaDestino());
        detalles.put("razon_rechazo", razonRechazo);

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.TRANSFERENCIA_RECHAZADA,
            transferencia.getIdUsuarioAprobador(),
            rolUsuario,
            transferencia.getIdTransferencia().toString(),
            detalles,
            "Transferencia rechazada"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar vencimiento de transferencia
     */
    public void registrarTransferenciaVencida(Transferencia transferencia) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("motivo_vencimiento", "Falta de aprobación a tiempo");
        detalles.put("fecha_hora_vencimiento", LocalDateTime.now());
        detalles.put("id_usuario_creador", transferencia.getIdUsuarioCreador());
        detalles.put("monto", transferencia.getMonto());

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.TRANSFERENCIA_VENCIDA,
            null,
            "SISTEMA",
            transferencia.getIdTransferencia().toString(),
            detalles,
            "Transferencia vencida por falta de aprobación"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar aprobación de préstamo
     */
    public void registrarAprobacionPrestamo(Prestamo prestamo, Long idAnalistaAprobador) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("monto_aprobado", prestamo.getMontoAprobado());
        detalles.put("tasa_interes", prestamo.getTasaInteres());
        detalles.put("estado_anterior", "En estudio");
        detalles.put("nuevo_estado", "Aprobado");
        detalles.put("id_analista_aprobador", idAnalistaAprobador);

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.APROBACION_PRESTAMO,
            idAnalistaAprobador,
            Enums.RolSistema.ANALISTA_INTERNO.name(),
            prestamo.getIdPrestamo().toString(),
            detalles,
            "Préstamo aprobado por Analista Interno"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar rechazo de préstamo
     */
    public void registrarRechazoPrestamo(Prestamo prestamo, Long idAnalistaAprobador, String razonRechazo) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("monto_solicitado", prestamo.getMontoSolicitado());
        detalles.put("estado_anterior", "En estudio");
        detalles.put("nuevo_estado", "Rechazado");
        detalles.put("id_analista_aprobador", idAnalistaAprobador);
        detalles.put("razon_rechazo", razonRechazo);

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.RECHAZO_PRESTAMO,
            idAnalistaAprobador,
            Enums.RolSistema.ANALISTA_INTERNO.name(),
            prestamo.getIdPrestamo().toString(),
            detalles,
            "Préstamo rechazado por Analista Interno"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Registrar desembolso de préstamo
     */
    public void registrarDesembolsoPrestamo(Prestamo prestamo, Long idAnalistaAprobador) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("monto_desembolsado", prestamo.getMontoAprobado());
        detalles.put("cuenta_destino", prestamo.getCuentaDestinoDesembolso());
        detalles.put("id_analista_aprobador", idAnalistaAprobador);

        BitacoraOperacion bitacora = new BitacoraOperacion(
            Enums.TipoOperacion.DESEMBOLSO_PRESTAMO,
            idAnalistaAprobador,
            Enums.RolSistema.ANALISTA_INTERNO.name(),
            prestamo.getIdPrestamo().toString(),
            detalles,
            "Desembolso de préstamo realizado"
        );
        bitacoraRepository.save(bitacora);
    }

    /**
     * Obtener operaciones por usuario
     */
    public List<BitacoraOperacion> obtenerOperacionesPorUsuario(Long idUsuario) {
        return bitacoraRepository.findByIdUsuario(idUsuario);
    }

    /**
     * Obtener operaciones por tipo
     */
    public List<BitacoraOperacion> obtenerOperacionesPorTipo(String tipoOperacion) {
        return bitacoraRepository.findByTipoOperacion(tipoOperacion);
    }

    /**
     * Obtener operaciones por producto afectado
     */
    public List<BitacoraOperacion> obtenerOperacionesPorProducto(String idProducto) {
        return bitacoraRepository.findByIdProductoAfectado(idProducto);
    }

    /**
     * Obtener todas las operaciones
     */
    public List<BitacoraOperacion> obtenerTodas() {
        return bitacoraRepository.findAll();
    }
}
