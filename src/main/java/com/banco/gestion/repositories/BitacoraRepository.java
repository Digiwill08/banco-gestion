package com.banco.gestion.repositories;

import com.banco.gestion.models.BitacoraOperacion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio MongoDB para BitacoraOperacion
 * Almacenamiento inmutable de todas las operaciones del sistema
 */
@Repository
public interface BitacoraRepository extends MongoRepository<BitacoraOperacion, String> {

    /**
     * Buscar operaciones por tipo
     */
    List<BitacoraOperacion> findByTipoOperacion(String tipoOperacion);

    /**
     * Buscar operaciones por usuario
     */
    List<BitacoraOperacion> findByIdUsuario(Long idUsuario);

    /**
     * Buscar operaciones por rol
     */
    List<BitacoraOperacion> findByRolUsuario(String rolUsuario);

    /**
     * Buscar operaciones por producto afectado
     */
    List<BitacoraOperacion> findByIdProductoAfectado(String idProductoAfectado);

    /**
     * Buscar operaciones por rango de fechas
     */
    List<BitacoraOperacion> findByFechaHoraOperacionBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Buscar operaciones por usuario y rango de fechas
     */
    @Query("{ 'id_usuario': ?0, 'fecha_hora_operacion': { $gte: ?1, $lte: ?2 } }")
    List<BitacoraOperacion> findOperacionesPorUsuarioYFecha(Long idUsuario, LocalDateTime inicio, LocalDateTime fin);

    /**
     * Buscar operaciones por tipo de operación y rango de fechas
     */
    @Query("{ 'tipo_operacion': ?0, 'fecha_hora_operacion': { $gte: ?1, $lte: ?2 } }")
    List<BitacoraOperacion> findOperacionesPorTipoYFecha(String tipoOperacion, LocalDateTime inicio, LocalDateTime fin);

    /**
     * Contar operaciones por tipo
     */
    long countByTipoOperacion(String tipoOperacion);

    /**
     * Contar operaciones por usuario
     */
    long countByIdUsuario(Long idUsuario);
}
