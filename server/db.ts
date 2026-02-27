import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES BANCARIAS
// ─────────────────────────────────────────────────────────────────────────────
import {
  bankUsers,
  bitacora,
  clientesEmpresa,
  clientesPersona,
  cuentasBancarias,
  InsertBankUser,
  InsertBitacora,
  InsertClienteEmpresa,
  InsertClientePersona,
  InsertCuentaBancaria,
  InsertPrestamo,
  InsertTransferencia,
  prestamos,
  productosBancarios,
  transferencias,
} from "../drizzle/schema";
import { and, desc, or } from "drizzle-orm";

// USUARIOS BANCARIOS
export async function getBankUserByIdentificacion(idIdentificacion: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bankUsers).where(eq(bankUsers.idIdentificacion, idIdentificacion)).limit(1);
  return result[0] ?? null;
}

export async function getBankUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bankUsers).where(eq(bankUsers.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllBankUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankUsers).orderBy(desc(bankUsers.createdAt));
}

export async function createBankUser(data: InsertBankUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bankUsers).values(data);
  return result[0].insertId;
}

export async function updateBankUser(id: number, data: Partial<InsertBankUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bankUsers).set(data).where(eq(bankUsers.id, id));
}

export async function getBankUsersByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankUsers).where(eq(bankUsers.empresaId, empresaId));
}

// CLIENTES PERSONA NATURAL
export async function getClientesPersona() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientesPersona).orderBy(desc(clientesPersona.createdAt));
}

export async function getClientePersonaByIdentificacion(numeroIdentificacion: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientesPersona).where(eq(clientesPersona.numeroIdentificacion, numeroIdentificacion)).limit(1);
  return result[0] ?? null;
}

export async function getClientePersonaByBankUserId(bankUserId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientesPersona).where(eq(clientesPersona.bankUserId, bankUserId)).limit(1);
  return result[0] ?? null;
}

export async function createClientePersona(data: InsertClientePersona) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientesPersona).values(data);
  return result[0].insertId;
}

// CLIENTES EMPRESA
export async function getClientesEmpresa() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientesEmpresa).orderBy(desc(clientesEmpresa.createdAt));
}

export async function getClienteEmpresaByNit(nit: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientesEmpresa).where(eq(clientesEmpresa.nit, nit)).limit(1);
  return result[0] ?? null;
}

export async function getClienteEmpresaByBankUserId(bankUserId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientesEmpresa).where(eq(clientesEmpresa.bankUserId, bankUserId)).limit(1);
  return result[0] ?? null;
}

export async function createClienteEmpresa(data: InsertClienteEmpresa) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientesEmpresa).values(data);
  return result[0].insertId;
}

// CUENTAS BANCARIAS
export async function getCuentasByTitular(idTitular: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cuentasBancarias).where(eq(cuentasBancarias.idTitular, idTitular)).orderBy(desc(cuentasBancarias.fechaApertura));
}

export async function getCuentaByNumero(numeroCuenta: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cuentasBancarias).where(eq(cuentasBancarias.numeroCuenta, numeroCuenta)).limit(1);
  return result[0] ?? null;
}

export async function getAllCuentas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cuentasBancarias).orderBy(desc(cuentasBancarias.fechaApertura));
}

export async function createCuenta(data: InsertCuentaBancaria) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cuentasBancarias).values(data);
  return result[0].insertId;
}

export async function updateCuentaSaldo(numeroCuenta: string, nuevoSaldo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cuentasBancarias).set({ saldoActual: nuevoSaldo }).where(eq(cuentasBancarias.numeroCuenta, numeroCuenta));
}

export async function updateCuentaEstado(numeroCuenta: string, estado: "activa" | "bloqueada" | "cancelada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cuentasBancarias).set({ estadoCuenta: estado }).where(eq(cuentasBancarias.numeroCuenta, numeroCuenta));
}

// PRÉSTAMOS
export async function getPrestamosByCliente(idClienteSolicitante: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prestamos).where(eq(prestamos.idClienteSolicitante, idClienteSolicitante)).orderBy(desc(prestamos.createdAt));
}

export async function getAllPrestamos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prestamos).orderBy(desc(prestamos.createdAt));
}

export async function getPrestamosPendientes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prestamos).where(eq(prestamos.estadoPrestamo, "en_estudio")).orderBy(desc(prestamos.createdAt));
}

export async function getPrestamoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(prestamos).where(eq(prestamos.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createPrestamo(data: InsertPrestamo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(prestamos).values(data);
  return result[0].insertId;
}

export async function updatePrestamo(id: number, data: Partial<InsertPrestamo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(prestamos).set(data).where(eq(prestamos.id, id));
}

// TRANSFERENCIAS
export async function getTransferenciasByUsuario(idUsuarioCreador: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transferencias).where(eq(transferencias.idUsuarioCreador, idUsuarioCreador)).orderBy(desc(transferencias.fechaCreacion));
}

export async function getTransferenciasByCuenta(numeroCuenta: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transferencias).where(or(eq(transferencias.cuentaOrigen, numeroCuenta), eq(transferencias.cuentaDestino, numeroCuenta))).orderBy(desc(transferencias.fechaCreacion));
}

export async function getTransferenciasEnEspera() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transferencias).where(eq(transferencias.estadoTransferencia, "en_espera_aprobacion")).orderBy(desc(transferencias.fechaCreacion));
}

export async function getTransferenciaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(transferencias).where(eq(transferencias.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createTransferencia(data: InsertTransferencia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(transferencias).values(data);
  return result[0].insertId;
}

export async function updateTransferencia(id: number, data: Partial<InsertTransferencia>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(transferencias).set(data).where(eq(transferencias.id, id));
}

// BITÁCORA
export async function createBitacoraEntry(data: InsertBitacora) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bitacora).values(data);
  return result[0].insertId;
}

export async function getBitacoraAll() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bitacora).orderBy(desc(bitacora.fechaHoraOperacion));
}

export async function getBitacoraByProducto(idProductoAfectado: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bitacora).where(eq(bitacora.idProductoAfectado, idProductoAfectado)).orderBy(desc(bitacora.fechaHoraOperacion));
}

// PRODUCTOS BANCARIOS
export async function getProductosBancarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productosBancarios);
}

// SEED — Datos iniciales de demostración
export async function seedDemoData() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getBankUserByIdentificacion("ADMIN001");
  if (existing) return { message: "Demo data already exists" };

  const analistaId = await createBankUser({
    nombreCompleto: "Ana García López",
    idIdentificacion: "ADMIN001",
    correoElectronico: "ana.garcia@banco.com",
    telefono: "3001234567",
    fechaNacimiento: new Date("1985-03-15"),
    direccion: "Calle 100 #15-20, Bogotá",
    rolSistema: "analista_interno",
    estadoUsuario: "activo",
    passwordHash: "password123",
  });

  await createBankUser({
    nombreCompleto: "Carlos Martínez",
    idIdentificacion: "EMP001",
    correoElectronico: "carlos.martinez@banco.com",
    telefono: "3009876543",
    fechaNacimiento: new Date("1990-07-22"),
    direccion: "Carrera 7 #45-10, Bogotá",
    rolSistema: "empleado_ventanilla",
    estadoUsuario: "activo",
    passwordHash: "password123",
  });

  await createBankUser({
    nombreCompleto: "Laura Rodríguez",
    idIdentificacion: "EMP002",
    correoElectronico: "laura.rodriguez@banco.com",
    telefono: "3005551234",
    fechaNacimiento: new Date("1988-11-05"),
    direccion: "Avenida 68 #23-45, Bogotá",
    rolSistema: "empleado_comercial",
    estadoUsuario: "activo",
    passwordHash: "password123",
  });

  const clientePersonaUserId = await createBankUser({
    nombreCompleto: "Juan Pérez Torres",
    idIdentificacion: "CC12345678",
    correoElectronico: "juan.perez@email.com",
    telefono: "3112345678",
    fechaNacimiento: new Date("1992-05-18"),
    direccion: "Calle 50 #30-15, Medellín",
    rolSistema: "cliente_persona",
    estadoUsuario: "activo",
    passwordHash: "password123",
  });

  await createClientePersona({
    bankUserId: clientePersonaUserId,
    nombreCompleto: "Juan Pérez Torres",
    numeroIdentificacion: "CC12345678",
    correoElectronico: "juan.perez@email.com",
    telefono: "3112345678",
    fechaNacimiento: new Date("1992-05-18"),
    direccion: "Calle 50 #30-15, Medellín",
  });

  const empresaUserId = await createBankUser({
    nombreCompleto: "TechCorp S.A.S.",
    idIdentificacion: "NIT900123456",
    correoElectronico: "admin@techcorp.com",
    telefono: "6012345678",
    direccion: "Zona Industrial #45-67, Bogotá",
    rolSistema: "cliente_empresa",
    estadoUsuario: "activo",
    passwordHash: "password123",
  });

  await createClienteEmpresa({
    bankUserId: empresaUserId,
    razonSocial: "TechCorp S.A.S.",
    nit: "NIT900123456",
    correoElectronico: "admin@techcorp.com",
    telefono: "6012345678",
    direccion: "Zona Industrial #45-67, Bogotá",
    representanteLegalId: "CC12345678",
  });

  await createBankUser({
    nombreCompleto: "María López Empresa",
    idIdentificacion: "CC98765432",
    correoElectronico: "maria.lopez@techcorp.com",
    telefono: "3209876543",
    fechaNacimiento: new Date("1980-09-12"),
    direccion: "Zona Industrial #45-67, Bogotá",
    rolSistema: "supervisor_empresa",
    estadoUsuario: "activo",
    passwordHash: "password123",
    empresaId: empresaUserId,
  });

  await createBankUser({
    nombreCompleto: "Pedro Gómez Operativo",
    idIdentificacion: "CC11223344",
    correoElectronico: "pedro.gomez@techcorp.com",
    telefono: "3151234567",
    fechaNacimiento: new Date("1995-02-28"),
    direccion: "Zona Industrial #45-67, Bogotá",
    rolSistema: "empleado_empresa",
    estadoUsuario: "activo",
    passwordHash: "password123",
    empresaId: empresaUserId,
  });

  await createCuenta({ numeroCuenta: "1001234567", tipoCuenta: "ahorros", idTitular: "CC12345678", saldoActual: "5000000.00", moneda: "COP", estadoCuenta: "activa" });
  await createCuenta({ numeroCuenta: "1009876543", tipoCuenta: "corriente", idTitular: "CC12345678", saldoActual: "1500000.00", moneda: "COP", estadoCuenta: "activa" });
  await createCuenta({ numeroCuenta: "2001234567", tipoCuenta: "empresarial", idTitular: "NIT900123456", saldoActual: "50000000.00", moneda: "COP", estadoCuenta: "activa" });

  await db.insert(productosBancarios).values([
    { codigoProducto: "CTA-AHO", nombreProducto: "Cuenta de Ahorros", categoria: "cuentas", requiereAprobacion: false, descripcion: "Cuenta de ahorros estándar" },
    { codigoProducto: "CTA-CTE", nombreProducto: "Cuenta Corriente", categoria: "cuentas", requiereAprobacion: false, descripcion: "Cuenta corriente" },
    { codigoProducto: "PRE-PER", nombreProducto: "Préstamo Personal", categoria: "prestamos", requiereAprobacion: true, descripcion: "Préstamo personal" },
    { codigoProducto: "PRE-HIP", nombreProducto: "Crédito Hipotecario", categoria: "prestamos", requiereAprobacion: true, descripcion: "Crédito hipotecario" },
    { codigoProducto: "PRE-EMP", nombreProducto: "Crédito Empresarial", categoria: "prestamos", requiereAprobacion: true, descripcion: "Crédito empresarial" },
  ]);

  return { message: "Demo data created successfully" };
}
