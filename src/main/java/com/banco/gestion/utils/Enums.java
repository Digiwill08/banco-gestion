package com.banco.gestion.utils;

/**
 * Enumeraciones para roles, estados y categorías del sistema
 */
public class Enums {

    /**
     * 7 Roles del Sistema Bancario
     */
    public enum RolSistema {
        CLIENTE_PERSONA_NATURAL("Cliente Persona Natural"),
        CLIENTE_EMPRESA("Cliente Empresa"),
        EMPLEADO_VENTANILLA("Empleado de Ventanilla"),
        EMPLEADO_COMERCIAL("Empleado Comercial"),
        EMPLEADO_EMPRESA("Empleado de Empresa"),
        SUPERVISOR_EMPRESA("Supervisor de Empresa"),
        ANALISTA_INTERNO("Analista Interno del Banco");

        private final String descripcion;

        RolSistema(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Estados de Usuario
     */
    public enum EstadoUsuario {
        ACTIVO("Activo"),
        INACTIVO("Inactivo"),
        BLOQUEADO("Bloqueado");

        private final String descripcion;

        EstadoUsuario(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Estados de Cuenta Bancaria
     */
    public enum EstadoCuenta {
        ACTIVA("Activa"),
        BLOQUEADA("Bloqueada"),
        CANCELADA("Cancelada");

        private final String descripcion;

        EstadoCuenta(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Tipos de Cuenta Bancaria
     */
    public enum TipoCuenta {
        AHORROS("Ahorros"),
        CORRIENTE("Corriente"),
        PERSONAL("Personal"),
        EMPRESARIAL("Empresarial");

        private final String descripcion;

        TipoCuenta(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Monedas Soportadas
     */
    public enum Moneda {
        COP("Peso Colombiano"),
        USD("Dólar Estadounidense"),
        EUR("Euro");

        private final String descripcion;

        Moneda(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Estados de Préstamo
     */
    public enum EstadoPrestamo {
        EN_ESTUDIO("En estudio"),
        APROBADO("Aprobado"),
        RECHAZADO("Rechazado"),
        DESEMBOLSADO("Desembolsado");

        private final String descripcion;

        EstadoPrestamo(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Estados de Transferencia
     */
    public enum EstadoTransferencia {
        EJECUTADA("Ejecutada"),
        EN_ESPERA_DE_APROBACION("En espera de aprobación"),
        RECHAZADA("Rechazada"),
        VENCIDA("Vencida");

        private final String descripcion;

        EstadoTransferencia(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Categorías de Producto Bancario
     */
    public enum CategoriaProducto {
        CUENTAS("Cuentas"),
        PRESTAMOS("Préstamos"),
        SERVICIOS("Servicios");

        private final String descripcion;

        CategoriaProducto(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }

    /**
     * Tipos de Operación en Bitácora
     */
    public enum TipoOperacion {
        TRANSFERENCIA_EJECUTADA("Transferencia Ejecutada"),
        TRANSFERENCIA_RECHAZADA("Transferencia Rechazada"),
        TRANSFERENCIA_VENCIDA("Transferencia Vencida"),
        APROBACION_PRESTAMO("Aprobación de Préstamo"),
        RECHAZO_PRESTAMO("Rechazo de Préstamo"),
        DESEMBOLSO_PRESTAMO("Desembolso de Préstamo"),
        APERTURA_CUENTA("Apertura de Cuenta"),
        BLOQUEO_CUENTA("Bloqueo de Cuenta"),
        CANCELACION_CUENTA("Cancelación de Cuenta"),
        CREACION_USUARIO("Creación de Usuario"),
        CAMBIO_ESTADO_USUARIO("Cambio de Estado de Usuario");

        private final String descripcion;

        TipoOperacion(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
    }
}
