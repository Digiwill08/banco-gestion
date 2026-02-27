/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS BANCARIOS COMPARTIDOS
// ─────────────────────────────────────────────────────────────────────────────

export type RolSistema =
  | "cliente_persona"
  | "cliente_empresa"
  | "empleado_ventanilla"
  | "empleado_comercial"
  | "empleado_empresa"
  | "supervisor_empresa"
  | "analista_interno";

export type EstadoUsuario = "activo" | "inactivo" | "bloqueado";
export type TipoCuenta = "ahorros" | "corriente" | "personal" | "empresarial";
export type EstadoCuenta = "activa" | "bloqueada" | "cancelada";
export type TipoPrestamo = "personal" | "hipotecario" | "vehiculo" | "empresarial" | "consumo";
export type EstadoPrestamo = "en_estudio" | "aprobado" | "rechazado" | "desembolsado";
export type EstadoTransferencia = "ejecutada" | "en_espera_aprobacion" | "rechazada" | "vencida";
export type Moneda = "COP" | "USD" | "EUR";

export const ROL_LABELS: Record<RolSistema, string> = {
  cliente_persona: "Cliente Persona Natural",
  cliente_empresa: "Cliente Empresa",
  empleado_ventanilla: "Empleado de Ventanilla",
  empleado_comercial: "Empleado Comercial",
  empleado_empresa: "Empleado de Empresa",
  supervisor_empresa: "Supervisor de Empresa",
  analista_interno: "Analista Interno",
};

export const ESTADO_CUENTA_LABELS: Record<EstadoCuenta, string> = {
  activa: "Activa",
  bloqueada: "Bloqueada",
  cancelada: "Cancelada",
};

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  ahorros: "Ahorros",
  corriente: "Corriente",
  personal: "Personal",
  empresarial: "Empresarial",
};

export const ESTADO_PRESTAMO_LABELS: Record<EstadoPrestamo, string> = {
  en_estudio: "En Estudio",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  desembolsado: "Desembolsado",
};

export const TIPO_PRESTAMO_LABELS: Record<TipoPrestamo, string> = {
  personal: "Personal",
  hipotecario: "Hipotecario",
  vehiculo: "Vehículo",
  empresarial: "Empresarial",
  consumo: "Consumo",
};

export const ESTADO_TRANSFERENCIA_LABELS: Record<EstadoTransferencia, string> = {
  ejecutada: "Ejecutada",
  en_espera_aprobacion: "En Espera de Aprobación",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

export const ESTADO_USUARIO_LABELS: Record<EstadoUsuario, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  bloqueado: "Bloqueado",
};

/** Umbral de monto para transferencias empresariales que requieren aprobación */
export const UMBRAL_APROBACION_TRANSFERENCIA = 5_000_000;

/** Tiempo máximo de espera para aprobación (1 hora en ms) */
export const TIEMPO_VENCIMIENTO_TRANSFERENCIA_MS = 60 * 60 * 1000;
