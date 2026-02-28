package com.banco.gestion.repositories;

import com.banco.gestion.models.Transferencia;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
