import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { UMBRAL_APROBACION_TRANSFERENCIA } from "../shared/types";

// ─── Procedimiento público (sin auth OAuth, usa auth bancaria propia) ─────────
const p = publicProcedure;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── SEED ─────────────────────────────────────────────────────────────────
  seed: router({
    init: p.mutation(() => db.seedDemoData()),
  }),

  // ─── AUTENTICACIÓN BANCARIA ───────────────────────────────────────────────
  bankAuth: router({
    login: p
      .input(z.object({ idIdentificacion: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const user = await db.getBankUserByIdentificacion(input.idIdentificacion);
        if (!user) throw new Error("Usuario no encontrado");
        if (user.estadoUsuario !== "activo") throw new Error("Usuario inactivo o bloqueado");
        // Comparación simple de contraseña (en producción usar bcrypt)
        if (user.passwordHash !== input.password) throw new Error("Contraseña incorrecta");
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
      }),
  }),

  // ─── USUARIOS BANCARIOS ───────────────────────────────────────────────────
  bankUsers: router({
    list: p.query(() => db.getAllBankUsers()),
    getById: p.input(z.object({ id: z.number() })).query(({ input }) => db.getBankUserById(input.id)),
    getByIdentificacion: p
      .input(z.object({ idIdentificacion: z.string() }))
      .query(({ input }) => db.getBankUserByIdentificacion(input.idIdentificacion)),
    create: p
      .input(
        z.object({
          nombreCompleto: z.string().min(2),
          idIdentificacion: z.string().min(3),
          correoElectronico: z.string().email(),
          telefono: z.string().min(7).max(15),
          fechaNacimiento: z.string().optional(),
          direccion: z.string().min(5),
          rolSistema: z.enum([
            "cliente_persona",
            "cliente_empresa",
            "empleado_ventanilla",
            "empleado_comercial",
            "empleado_empresa",
            "supervisor_empresa",
            "analista_interno",
          ]),
          password: z.string().min(6),
          empresaId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await db.getBankUserByIdentificacion(input.idIdentificacion);
        if (existing) throw new Error("Ya existe un usuario con esa identificación");
        const id = await db.createBankUser({
          nombreCompleto: input.nombreCompleto,
          idIdentificacion: input.idIdentificacion,
          correoElectronico: input.correoElectronico,
          telefono: input.telefono,
          fechaNacimiento: input.fechaNacimiento ? new Date(input.fechaNacimiento) : undefined,
          direccion: input.direccion,
          rolSistema: input.rolSistema,
          estadoUsuario: "activo",
          passwordHash: input.password,
          empresaId: input.empresaId,
        });
        return { id };
      }),
    updateEstado: p
      .input(z.object({ id: z.number(), estadoUsuario: z.enum(["activo", "inactivo", "bloqueado"]) }))
      .mutation(async ({ input }) => {
        await db.updateBankUser(input.id, { estadoUsuario: input.estadoUsuario });
        return { success: true };
      }),
  }),

  // ─── CLIENTES PERSONA NATURAL ─────────────────────────────────────────────
  clientesPersona: router({
    list: p.query(() => db.getClientesPersona()),
    getByIdentificacion: p
      .input(z.object({ numeroIdentificacion: z.string() }))
      .query(({ input }) => db.getClientePersonaByIdentificacion(input.numeroIdentificacion)),
    create: p
      .input(
        z.object({
          bankUserId: z.number(),
          nombreCompleto: z.string().min(2),
          numeroIdentificacion: z.string().min(3),
          correoElectronico: z.string().email(),
          telefono: z.string().min(7).max(15),
          fechaNacimiento: z.string(),
          direccion: z.string().min(5),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await db.getClientePersonaByIdentificacion(input.numeroIdentificacion);
        if (existing) throw new Error("Ya existe un cliente con esa identificación");
        const id = await db.createClientePersona({
          ...input,
          fechaNacimiento: new Date(input.fechaNacimiento),
        });
        return { id };
      }),
  }),

  // ─── CLIENTES EMPRESA ─────────────────────────────────────────────────────
  clientesEmpresa: router({
    list: p.query(() => db.getClientesEmpresa()),
    getByNit: p
      .input(z.object({ nit: z.string() }))
      .query(({ input }) => db.getClienteEmpresaByNit(input.nit)),
    create: p
      .input(
        z.object({
          bankUserId: z.number(),
          razonSocial: z.string().min(2),
          nit: z.string().min(3),
          correoElectronico: z.string().email(),
          telefono: z.string().min(7).max(15),
          direccion: z.string().min(5),
          representanteLegalId: z.string().min(3),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await db.getClienteEmpresaByNit(input.nit);
        if (existing) throw new Error("Ya existe una empresa con ese NIT");
        const id = await db.createClienteEmpresa(input);
        return { id };
      }),
  }),

  // ─── CUENTAS BANCARIAS ────────────────────────────────────────────────────
  cuentas: router({
    listByTitular: p
      .input(z.object({ idTitular: z.string() }))
      .query(({ input }) => db.getCuentasByTitular(input.idTitular)),
    getByNumero: p
      .input(z.object({ numeroCuenta: z.string() }))
      .query(({ input }) => db.getCuentaByNumero(input.numeroCuenta)),
    listAll: p.query(() => db.getAllCuentas()),
    create: p
      .input(
        z.object({
          tipoCuenta: z.enum(["ahorros", "corriente", "personal", "empresarial"]),
          idTitular: z.string().min(3),
          moneda: z.enum(["COP", "USD", "EUR"]).default("COP"),
          abiertaPorId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Verificar que el titular existe y está activo
        const titular = await db.getBankUserByIdentificacion(input.idTitular);
        if (!titular) throw new Error("Titular no encontrado");
        if (titular.estadoUsuario !== "activo") throw new Error("No se puede abrir cuenta a usuario inactivo o bloqueado");

        // Generar número de cuenta único
        const numeroCuenta = `${Date.now()}`.slice(-10);
        const existing = await db.getCuentaByNumero(numeroCuenta);
        if (existing) throw new Error("Error generando número de cuenta, intente de nuevo");

        const id = await db.createCuenta({
          numeroCuenta,
          tipoCuenta: input.tipoCuenta,
          idTitular: input.idTitular,
          saldoActual: "0.00",
          moneda: input.moneda,
          estadoCuenta: "activa",
          abiertaPorId: input.abiertaPorId,
        });
        return { id, numeroCuenta };
      }),
    updateEstado: p
      .input(z.object({ numeroCuenta: z.string(), estado: z.enum(["activa", "bloqueada", "cancelada"]) }))
      .mutation(async ({ input }) => {
        await db.updateCuentaEstado(input.numeroCuenta, input.estado);
        return { success: true };
      }),
    historial: p
      .input(z.object({ numeroCuenta: z.string() }))
      .query(({ input }) => db.getTransferenciasByCuenta(input.numeroCuenta)),
  }),

  // ─── PRÉSTAMOS ────────────────────────────────────────────────────────────
  prestamos: router({
    listByCliente: p
      .input(z.object({ idClienteSolicitante: z.string() }))
      .query(({ input }) => db.getPrestamosByCliente(input.idClienteSolicitante)),
    listAll: p.query(() => db.getAllPrestamos()),
    listPendientes: p.query(() => db.getPrestamosPendientes()),
    getById: p
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPrestamoById(input.id)),
    create: p
      .input(
        z.object({
          tipoPrestamo: z.enum(["personal", "hipotecario", "vehiculo", "empresarial", "consumo"]),
          idClienteSolicitante: z.string().min(3),
          montoSolicitado: z.number().positive(),
          plazoMeses: z.number().int().positive(),
          cuentaDestinoDesembolso: z.string().optional(),
          creadoPorId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        // Verificar que el cliente existe y está activo
        const cliente = await db.getBankUserByIdentificacion(input.idClienteSolicitante);
        if (!cliente) throw new Error("Cliente no encontrado");
        if (cliente.estadoUsuario !== "activo") throw new Error("Cliente inactivo o bloqueado");

        const id = await db.createPrestamo({
          tipoPrestamo: input.tipoPrestamo,
          idClienteSolicitante: input.idClienteSolicitante,
          montoSolicitado: input.montoSolicitado.toString(),
          plazoMeses: input.plazoMeses,
          estadoPrestamo: "en_estudio",
          cuentaDestinoDesembolso: input.cuentaDestinoDesembolso,
          creadoPorId: input.creadoPorId,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "SOLICITUD_PRESTAMO",
          idUsuario: input.creadoPorId,
          rolUsuario: cliente.rolSistema,
          idProductoAfectado: id.toString(),
          datosDetalle: JSON.stringify({
            tipoPrestamo: input.tipoPrestamo,
            montoSolicitado: input.montoSolicitado,
            plazoMeses: input.plazoMeses,
            estado: "en_estudio",
          }),
        });

        return { id };
      }),
    aprobar: p
      .input(
        z.object({
          id: z.number(),
          montoAprobado: z.number().positive(),
          tasaInteres: z.number().positive(),
          analistaId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const prestamo = await db.getPrestamoById(input.id);
        if (!prestamo) throw new Error("Préstamo no encontrado");
        if (prestamo.estadoPrestamo !== "en_estudio") throw new Error("Solo se pueden aprobar préstamos en estudio");

        await db.updatePrestamo(input.id, {
          estadoPrestamo: "aprobado",
          montoAprobado: input.montoAprobado.toString(),
          tasaInteres: input.tasaInteres.toString(),
          fechaAprobacion: new Date(),
          aprobadoPorId: input.analistaId,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "APROBACION_PRESTAMO",
          idUsuario: input.analistaId,
          rolUsuario: "analista_interno",
          idProductoAfectado: input.id.toString(),
          datosDetalle: JSON.stringify({
            estadoAnterior: "en_estudio",
            nuevoEstado: "aprobado",
            montoAprobado: input.montoAprobado,
            tasaInteres: input.tasaInteres,
            idAnalistaAprobador: input.analistaId,
          }),
        });

        return { success: true };
      }),
    rechazar: p
      .input(z.object({ id: z.number(), motivo: z.string().min(5), analistaId: z.number() }))
      .mutation(async ({ input }) => {
        const prestamo = await db.getPrestamoById(input.id);
        if (!prestamo) throw new Error("Préstamo no encontrado");
        if (prestamo.estadoPrestamo !== "en_estudio") throw new Error("Solo se pueden rechazar préstamos en estudio");

        await db.updatePrestamo(input.id, {
          estadoPrestamo: "rechazado",
          motivoRechazo: input.motivo,
          fechaAprobacion: new Date(),
          aprobadoPorId: input.analistaId,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "RECHAZO_PRESTAMO",
          idUsuario: input.analistaId,
          rolUsuario: "analista_interno",
          idProductoAfectado: input.id.toString(),
          datosDetalle: JSON.stringify({
            estadoAnterior: "en_estudio",
            nuevoEstado: "rechazado",
            motivo: input.motivo,
            idAnalistaAprobador: input.analistaId,
          }),
        });

        return { success: true };
      }),
    desembolsar: p
      .input(z.object({ id: z.number(), cuentaDestino: z.string(), analistaId: z.number() }))
      .mutation(async ({ input }) => {
        const prestamo = await db.getPrestamoById(input.id);
        if (!prestamo) throw new Error("Préstamo no encontrado");
        if (prestamo.estadoPrestamo !== "aprobado") throw new Error("Solo se pueden desembolsar préstamos aprobados");
        if (!prestamo.montoAprobado || parseFloat(prestamo.montoAprobado) <= 0) throw new Error("Monto aprobado inválido");

        const cuenta = await db.getCuentaByNumero(input.cuentaDestino);
        if (!cuenta) throw new Error("Cuenta destino no encontrada");
        if (cuenta.estadoCuenta !== "activa") throw new Error("Cuenta destino no está activa");

        const saldoAntes = parseFloat(cuenta.saldoActual);
        const monto = parseFloat(prestamo.montoAprobado);
        const saldoDespues = saldoAntes + monto;

        await db.updateCuentaSaldo(input.cuentaDestino, saldoDespues.toFixed(2));
        await db.updatePrestamo(input.id, {
          estadoPrestamo: "desembolsado",
          fechaDesembolso: new Date(),
          cuentaDestinoDesembolso: input.cuentaDestino,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "DESEMBOLSO_PRESTAMO",
          idUsuario: input.analistaId,
          rolUsuario: "analista_interno",
          idProductoAfectado: input.id.toString(),
          datosDetalle: JSON.stringify({
            estadoAnterior: "aprobado",
            nuevoEstado: "desembolsado",
            montoDesembolsado: monto,
            cuentaDestino: input.cuentaDestino,
            saldoAntesCuenta: saldoAntes,
            saldoDespuesCuenta: saldoDespues,
          }),
        });

        return { success: true };
      }),
  }),

  // ─── TRANSFERENCIAS ───────────────────────────────────────────────────────
  transferencias: router({
    listByUsuario: p
      .input(z.object({ idUsuarioCreador: z.number() }))
      .query(({ input }) => db.getTransferenciasByUsuario(input.idUsuarioCreador)),
    listByCuenta: p
      .input(z.object({ numeroCuenta: z.string() }))
      .query(({ input }) => db.getTransferenciasByCuenta(input.numeroCuenta)),
    listEnEspera: p.query(() => db.getTransferenciasEnEspera()),
    getById: p
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTransferenciaById(input.id)),
    create: p
      .input(
        z.object({
          cuentaOrigen: z.string(),
          cuentaDestino: z.string(),
          monto: z.number().positive(),
          concepto: z.string().optional(),
          idUsuarioCreador: z.number(),
          esEmpresarial: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        if (input.cuentaOrigen === input.cuentaDestino) throw new Error("Las cuentas origen y destino no pueden ser iguales");

        const cuentaOrigen = await db.getCuentaByNumero(input.cuentaOrigen);
        if (!cuentaOrigen) throw new Error("Cuenta origen no encontrada");
        if (cuentaOrigen.estadoCuenta !== "activa") throw new Error("Cuenta origen bloqueada o cancelada");

        const cuentaDestino = await db.getCuentaByNumero(input.cuentaDestino);
        if (!cuentaDestino) throw new Error("Cuenta destino no encontrada");

        // Determinar si requiere aprobación
        const requiereAprobacion = input.esEmpresarial && input.monto > UMBRAL_APROBACION_TRANSFERENCIA;

        if (!requiereAprobacion) {
          // Verificar saldo suficiente
          const saldoOrigen = parseFloat(cuentaOrigen.saldoActual);
          if (saldoOrigen < input.monto) throw new Error("Saldo insuficiente en cuenta origen");

          const saldoAntesDest = parseFloat(cuentaDestino.saldoActual);
          const nuevoSaldoOrigen = saldoOrigen - input.monto;
          const nuevoSaldoDest = saldoAntesDest + input.monto;

          await db.updateCuentaSaldo(input.cuentaOrigen, nuevoSaldoOrigen.toFixed(2));
          await db.updateCuentaSaldo(input.cuentaDestino, nuevoSaldoDest.toFixed(2));

          const id = await db.createTransferencia({
            cuentaOrigen: input.cuentaOrigen,
            cuentaDestino: input.cuentaDestino,
            monto: input.monto.toString(),
            estadoTransferencia: "ejecutada",
            idUsuarioCreador: input.idUsuarioCreador,
            concepto: input.concepto,
          });

          await db.createBitacoraEntry({
            tipoOperacion: "TRANSFERENCIA_EJECUTADA",
            idUsuario: input.idUsuarioCreador,
            rolUsuario: "cliente_persona",
            idProductoAfectado: id.toString(),
            datosDetalle: JSON.stringify({
              monto: input.monto,
              cuentaOrigen: input.cuentaOrigen,
              cuentaDestino: input.cuentaDestino,
              saldoAntesOrigen: saldoOrigen,
              saldoDespuesOrigen: nuevoSaldoOrigen,
              saldoAntesDest,
              saldoDespuesDest: nuevoSaldoDest,
            }),
          });

          return { id, estado: "ejecutada" };
        } else {
          // Crear en espera de aprobación
          const id = await db.createTransferencia({
            cuentaOrigen: input.cuentaOrigen,
            cuentaDestino: input.cuentaDestino,
            monto: input.monto.toString(),
            estadoTransferencia: "en_espera_aprobacion",
            idUsuarioCreador: input.idUsuarioCreador,
            concepto: input.concepto,
          });

          await db.createBitacoraEntry({
            tipoOperacion: "TRANSFERENCIA_EN_ESPERA",
            idUsuario: input.idUsuarioCreador,
            rolUsuario: "empleado_empresa",
            idProductoAfectado: id.toString(),
            datosDetalle: JSON.stringify({
              monto: input.monto,
              cuentaOrigen: input.cuentaOrigen,
              cuentaDestino: input.cuentaDestino,
              motivo: "Monto supera umbral de aprobación",
            }),
          });

          return { id, estado: "en_espera_aprobacion" };
        }
      }),
    aprobar: p
      .input(z.object({ id: z.number(), supervisorId: z.number() }))
      .mutation(async ({ input }) => {
        const transferencia = await db.getTransferenciaById(input.id);
        if (!transferencia) throw new Error("Transferencia no encontrada");
        if (transferencia.estadoTransferencia !== "en_espera_aprobacion") throw new Error("Transferencia no está en espera de aprobación");

        // Verificar vencimiento
        const ahora = new Date();
        const creacion = new Date(transferencia.fechaCreacion);
        const diffMs = ahora.getTime() - creacion.getTime();
        if (diffMs > 60 * 60 * 1000) {
          await db.updateTransferencia(input.id, { estadoTransferencia: "vencida" });
          await db.createBitacoraEntry({
            tipoOperacion: "TRANSFERENCIA_VENCIDA",
            idUsuario: input.supervisorId,
            rolUsuario: "supervisor_empresa",
            idProductoAfectado: input.id.toString(),
            datosDetalle: JSON.stringify({
              motivo: "Vencida por falta de aprobación en el tiempo establecido",
              fechaVencimiento: ahora.toISOString(),
              idUsuarioCreador: transferencia.idUsuarioCreador,
            }),
          });
          throw new Error("La transferencia ha vencido por falta de aprobación");
        }

        const cuentaOrigen = await db.getCuentaByNumero(transferencia.cuentaOrigen);
        if (!cuentaOrigen) throw new Error("Cuenta origen no encontrada");
        if (cuentaOrigen.estadoCuenta !== "activa") throw new Error("Cuenta origen bloqueada o cancelada");

        const saldoOrigen = parseFloat(cuentaOrigen.saldoActual);
        const monto = parseFloat(transferencia.monto);
        if (saldoOrigen < monto) throw new Error("Saldo insuficiente en cuenta origen");

        const cuentaDestino = await db.getCuentaByNumero(transferencia.cuentaDestino);
        if (!cuentaDestino) throw new Error("Cuenta destino no encontrada");

        const saldoAntesDest = parseFloat(cuentaDestino.saldoActual);
        const nuevoSaldoOrigen = saldoOrigen - monto;
        const nuevoSaldoDest = saldoAntesDest + monto;

        await db.updateCuentaSaldo(transferencia.cuentaOrigen, nuevoSaldoOrigen.toFixed(2));
        await db.updateCuentaSaldo(transferencia.cuentaDestino, nuevoSaldoDest.toFixed(2));
        await db.updateTransferencia(input.id, {
          estadoTransferencia: "ejecutada",
          fechaAprobacion: new Date(),
          idUsuarioAprobador: input.supervisorId,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "TRANSFERENCIA_APROBADA",
          idUsuario: input.supervisorId,
          rolUsuario: "supervisor_empresa",
          idProductoAfectado: input.id.toString(),
          datosDetalle: JSON.stringify({
            monto,
            cuentaOrigen: transferencia.cuentaOrigen,
            cuentaDestino: transferencia.cuentaDestino,
            saldoAntesOrigen: saldoOrigen,
            saldoDespuesOrigen: nuevoSaldoOrigen,
            saldoAntesDest,
            saldoDespuesDest: nuevoSaldoDest,
          }),
        });

        return { success: true };
      }),
    rechazar: p
      .input(z.object({ id: z.number(), supervisorId: z.number(), motivo: z.string().optional() }))
      .mutation(async ({ input }) => {
        const transferencia = await db.getTransferenciaById(input.id);
        if (!transferencia) throw new Error("Transferencia no encontrada");
        if (transferencia.estadoTransferencia !== "en_espera_aprobacion") throw new Error("Transferencia no está en espera de aprobación");

        await db.updateTransferencia(input.id, {
          estadoTransferencia: "rechazada",
          fechaAprobacion: new Date(),
          idUsuarioAprobador: input.supervisorId,
        });

        await db.createBitacoraEntry({
          tipoOperacion: "TRANSFERENCIA_RECHAZADA",
          idUsuario: input.supervisorId,
          rolUsuario: "supervisor_empresa",
          idProductoAfectado: input.id.toString(),
          datosDetalle: JSON.stringify({
            motivo: input.motivo ?? "Rechazada por supervisor",
            idUsuarioCreador: transferencia.idUsuarioCreador,
          }),
        });

        return { success: true };
      }),
    verificarVencidas: p.mutation(async () => {
      const enEspera = await db.getTransferenciasEnEspera();
      const ahora = new Date();
      let vencidas = 0;
      for (const t of enEspera) {
        const creacion = new Date(t.fechaCreacion);
        const diffMs = ahora.getTime() - creacion.getTime();
        if (diffMs > 60 * 60 * 1000) {
          await db.updateTransferencia(t.id, { estadoTransferencia: "vencida" });
          await db.createBitacoraEntry({
            tipoOperacion: "TRANSFERENCIA_VENCIDA",
            idUsuario: 0,
            rolUsuario: "sistema",
            idProductoAfectado: t.id.toString(),
            datosDetalle: JSON.stringify({
              motivo: "Vencida por falta de aprobación en el tiempo establecido",
              fechaVencimiento: ahora.toISOString(),
              idUsuarioCreador: t.idUsuarioCreador,
            }),
          });
          vencidas++;
        }
      }
      return { vencidas };
    }),
  }),

  // ─── BITÁCORA ─────────────────────────────────────────────────────────────
  bitacora: router({
    listAll: p.query(() => db.getBitacoraAll()),
    listByProducto: p
      .input(z.object({ idProductoAfectado: z.string() }))
      .query(({ input }) => db.getBitacoraByProducto(input.idProductoAfectado)),
  }),

  // ─── PRODUCTOS BANCARIOS ──────────────────────────────────────────────────
  productos: router({
    list: p.query(() => db.getProductosBancarios()),
  }),
});

export type AppRouter = typeof appRouter;
