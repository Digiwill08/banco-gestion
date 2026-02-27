package com.banco.gestion.models;

import com.banco.gestion.utils.Enums;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entidad BitacoraOperacion - Almacenada en MongoDB (NoSQL)
 * Registro inmutable de todas las operaciones significativas del sistema
 * Propósito: Auditoría, trazabilidad y cumplimiento normativo
 * NO se utiliza para calcular Saldo_Actual (que está en BD Relacional)
 */
@Document(collection = "bitacora_operaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BitacoraOperacion {

    @Id
    private String idBitacora;

    @JsonProperty("tipo_operacion")
    private String tipoOperacion;

    @JsonProperty("fecha_hora_operacion")
    private LocalDateTime fechaHoraOperacion = LocalDateTime.now();

    @JsonProperty("id_usuario")
    private Long idUsuario;

    @JsonProperty("rol_usuario")
    private String rolUsuario;

    @JsonProperty("id_producto_afectado")
    private String idProductoAfectado;

    @JsonProperty("datos_detalle")
    private Map<String, Object> datosDetalle;

    @JsonProperty("descripcion")
    private String descripcion;

    /**
     * Constructor para crear un registro de bitácora completo
     */
    public BitacoraOperacion(Enums.TipoOperacion tipoOperacion, Long idUsuario, String rolUsuario,
                            String idProductoAfectado, Map<String, Object> datosDetalle, String descripcion) {
        this.tipoOperacion = tipoOperacion.name();
        this.fechaHoraOperacion = LocalDateTime.now();
        this.idUsuario = idUsuario;
        this.rolUsuario = rolUsuario;
        this.idProductoAfectado = idProductoAfectado;
        this.datosDetalle = datosDetalle;
        this.descripcion = descripcion;
    }

    /**
     * Ejemplo de estructura para Transferencia Ejecutada
     * {
     *   "monto_involucrado": 1000000,
     *   "saldo_antes_origen": 5000000,
     *   "saldo_despues_origen": 4000000,
     *   "saldo_antes_destino": 2000000,
     *   "saldo_despues_destino": 3000000
     * }
     */

    /**
     * Ejemplo de estructura para Aprobación de Préstamo
     * {
     *   "monto_aprobado": 5000000,
     *   "tasa_interes": 12.5,
     *   "estado_anterior": "En estudio",
     *   "nuevo_estado": "Aprobado",
     *   "id_analista_aprobador": 123
     * }
     */

    /**
     * Ejemplo de estructura para Vencimiento de Transferencia
     * {
     *   "motivo_vencimiento": "Falta de aprobación a tiempo",
     *   "fecha_hora_vencimiento": "2024-01-15 14:30:00",
     *   "id_usuario_creador": 456
     * }
     */
}
