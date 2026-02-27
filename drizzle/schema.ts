import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS DEL SISTEMA BANCARIO
// ─────────────────────────────────────────────────────────────────────────────

export const bankUsers = mysqlTable("bank_users", {
  id: int("id").autoincrement().primaryKey(),
  /** Referencia al usuario de autenticación OAuth */
  authUserId: int("authUserId"),
  /** Identificador de la entidad cliente asociada (persona natural o empresa) */
  idRelacionado: varchar("idRelacionado", { length: 64 }),
  nombreCompleto: varchar("nombreCompleto", { length: 255 }).notNull(),
  /** DNI, Cédula, NIT — único en el sistema */
  idIdentificacion: varchar("idIdentificacion", { length: 64 }).notNull().unique(),
  correoElectronico: varchar("correoElectronico", { length: 320 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  fechaNacimiento: timestamp("fechaNacimiento"),
  direccion: text("direccion").notNull(),
  rolSistema: mysqlEnum("rolSistema", [
    "cliente_persona",
    "cliente_empresa",
    "empleado_ventanilla",
    "empleado_comercial",
    "empleado_empresa",
    "supervisor_empresa",
    "analista_interno",
  ]).notNull(),
  estadoUsuario: mysqlEnum("estadoUsuario", ["activo", "inactivo", "bloqueado"])
    .default("activo")
    .notNull(),
  /** Hash de contraseña para autenticación interna */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  /** ID de la empresa a la que pertenece (para empleados/supervisores de empresa) */
  empresaId: int("empresaId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankUser = typeof bankUsers.$inferSelect;
export type InsertBankUser = typeof bankUsers.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES — PERSONA NATURAL
// ─────────────────────────────────────────────────────────────────────────────

export const clientesPersona = mysqlTable("clientes_persona", {
  id: int("id").autoincrement().primaryKey(),
  bankUserId: int("bankUserId").notNull(),
  nombreCompleto: varchar("nombreCompleto", { length: 255 }).notNull(),
  /** Cédula o DNI — único en el sistema */
  numeroIdentificacion: varchar("numeroIdentificacion", { length: 64 }).notNull().unique(),
  correoElectronico: varchar("correoElectronico", { length: 320 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  fechaNacimiento: timestamp("fechaNacimiento").notNull(),
  direccion: text("direccion").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientePersona = typeof clientesPersona.$inferSelect;
export type InsertClientePersona = typeof clientesPersona.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES — EMPRESA
// ─────────────────────────────────────────────────────────────────────────────

export const clientesEmpresa = mysqlTable("clientes_empresa", {
  id: int("id").autoincrement().primaryKey(),
  bankUserId: int("bankUserId").notNull(),
  razonSocial: varchar("razonSocial", { length: 255 }).notNull(),
  /** NIT — único en el sistema */
  nit: varchar("nit", { length: 64 }).notNull().unique(),
  correoElectronico: varchar("correoElectronico", { length: 320 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  direccion: text("direccion").notNull(),
  /** Referencia al ID de identificación del representante legal (persona natural) */
  representanteLegalId: varchar("representanteLegalId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClienteEmpresa = typeof clientesEmpresa.$inferSelect;
export type InsertClienteEmpresa = typeof clientesEmpresa.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// CUENTAS BANCARIAS
// ─────────────────────────────────────────────────────────────────────────────

export const cuentasBancarias = mysqlTable("cuentas_bancarias", {
  id: int("id").autoincrement().primaryKey(),
  /** Número de cuenta único */
  numeroCuenta: varchar("numeroCuenta", { length: 20 }).notNull().unique(),
  tipoCuenta: mysqlEnum("tipoCuenta", ["ahorros", "corriente", "personal", "empresarial"]).notNull(),
  /** ID de identificación del titular (persona o empresa) */
  idTitular: varchar("idTitular", { length: 64 }).notNull(),
  saldoActual: decimal("saldoActual", { precision: 15, scale: 2 }).default("0.00").notNull(),
  moneda: mysqlEnum("moneda", ["COP", "USD", "EUR"]).default("COP").notNull(),
  estadoCuenta: mysqlEnum("estadoCuenta", ["activa", "bloqueada", "cancelada"])
    .default("activa")
    .notNull(),
  fechaApertura: timestamp("fechaApertura").defaultNow().notNull(),
  /** ID del banco user que abrió la cuenta */
  abiertaPorId: int("abiertaPorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CuentaBancaria = typeof cuentasBancarias.$inferSelect;
export type InsertCuentaBancaria = typeof cuentasBancarias.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// PRÉSTAMOS / CRÉDITOS
// ─────────────────────────────────────────────────────────────────────────────

export const prestamos = mysqlTable("prestamos", {
  id: int("id").autoincrement().primaryKey(),
  tipoPrestamo: mysqlEnum("tipoPrestamo", [
    "personal",
    "hipotecario",
    "vehiculo",
    "empresarial",
    "consumo",
  ]).notNull(),
  /** ID de identificación del cliente solicitante */
  idClienteSolicitante: varchar("idClienteSolicitante", { length: 64 }).notNull(),
  montoSolicitado: decimal("montoSolicitado", { precision: 15, scale: 2 }).notNull(),
  montoAprobado: decimal("montoAprobado", { precision: 15, scale: 2 }),
  tasaInteres: decimal("tasaInteres", { precision: 5, scale: 2 }),
  plazoMeses: int("plazoMeses").notNull(),
  estadoPrestamo: mysqlEnum("estadoPrestamo", [
    "en_estudio",
    "aprobado",
    "rechazado",
    "desembolsado",
  ])
    .default("en_estudio")
    .notNull(),
  fechaAprobacion: timestamp("fechaAprobacion"),
  fechaDesembolso: timestamp("fechaDesembolso"),
  cuentaDestinoDesembolso: varchar("cuentaDestinoDesembolso", { length: 20 }),
  /** ID del bank_user que creó la solicitud */
  creadoPorId: int("creadoPorId").notNull(),
  /** ID del analista que aprobó/rechazó */
  aprobadoPorId: int("aprobadoPorId"),
  motivoRechazo: text("motivoRechazo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prestamo = typeof prestamos.$inferSelect;
export type InsertPrestamo = typeof prestamos.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFERENCIAS
// ─────────────────────────────────────────────────────────────────────────────

export const transferencias = mysqlTable("transferencias", {
  id: int("id").autoincrement().primaryKey(),
  cuentaOrigen: varchar("cuentaOrigen", { length: 20 }).notNull(),
  cuentaDestino: varchar("cuentaDestino", { length: 20 }).notNull(),
  monto: decimal("monto", { precision: 15, scale: 2 }).notNull(),
  fechaCreacion: timestamp("fechaCreacion").defaultNow().notNull(),
  fechaAprobacion: timestamp("fechaAprobacion"),
  estadoTransferencia: mysqlEnum("estadoTransferencia", [
    "ejecutada",
    "en_espera_aprobacion",
    "rechazada",
    "vencida",
  ])
    .default("ejecutada")
    .notNull(),
  /** ID del bank_user que creó la transferencia */
  idUsuarioCreador: int("idUsuarioCreador").notNull(),
  /** ID del bank_user que aprobó (si aplica) */
  idUsuarioAprobador: int("idUsuarioAprobador"),
  concepto: varchar("concepto", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transferencia = typeof transferencias.$inferSelect;
export type InsertTransferencia = typeof transferencias.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// BITÁCORA DE OPERACIONES (almacenada como JSON en MySQL)
// ─────────────────────────────────────────────────────────────────────────────

export const bitacora = mysqlTable("bitacora", {
  id: int("id").autoincrement().primaryKey(),
  tipoOperacion: varchar("tipoOperacion", { length: 100 }).notNull(),
  fechaHoraOperacion: timestamp("fechaHoraOperacion").defaultNow().notNull(),
  idUsuario: int("idUsuario").notNull(),
  rolUsuario: varchar("rolUsuario", { length: 64 }).notNull(),
  /** Referencia al producto afectado (cuenta, préstamo, transferencia) */
  idProductoAfectado: varchar("idProductoAfectado", { length: 64 }).notNull(),
  /** Datos detallados en formato JSON */
  datosDetalle: text("datosDetalle").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bitacora = typeof bitacora.$inferSelect;
export type InsertBitacora = typeof bitacora.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE PRODUCTOS BANCARIOS
// ─────────────────────────────────────────────────────────────────────────────

export const productosBancarios = mysqlTable("productos_bancarios", {
  id: int("id").autoincrement().primaryKey(),
  codigoProducto: varchar("codigoProducto", { length: 20 }).notNull().unique(),
  nombreProducto: varchar("nombreProducto", { length: 255 }).notNull(),
  categoria: mysqlEnum("categoria", ["cuentas", "prestamos", "servicios"]).notNull(),
  requiereAprobacion: boolean("requiereAprobacion").default(false).notNull(),
  descripcion: text("descripcion"),
  activo: boolean("activo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductoBancario = typeof productosBancarios.$inferSelect;
export type InsertProductoBancario = typeof productosBancarios.$inferInsert;
