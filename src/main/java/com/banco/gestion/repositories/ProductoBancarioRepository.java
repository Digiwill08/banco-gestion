package com.banco.gestion.repositories;

import com.banco.gestion.models.ProductoBancario;
import com.banco.gestion.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para ProductoBancario
 */
@Repository
public interface ProductoBancarioRepository extends JpaRepository<ProductoBancario, Long> {
    Optional<ProductoBancario> findByCodigoProducto(String codigoProducto);
    List<ProductoBancario> findByCategoria(Enums.CategoriaProducto categoria);
    List<ProductoBancario> findByRequiereAprobacion(Boolean requiereAprobacion);
}
