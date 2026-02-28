package com.banco.gestion.repositories;

import com.banco.gestion.models.Prestamo;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
