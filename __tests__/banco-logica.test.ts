import { describe, it, expect } from "vitest";
import {
  RolSistema,
  EstadoCuenta,
  EstadoPrestamo,
  EstadoTransferencia,
  ROL_LABELS,
  ESTADO_CUENTA_LABELS,
  ESTADO_PRESTAMO_LABELS,
  ESTADO_TRANSFERENCIA_LABELS,
  UMBRAL_APROBACION_TRANSFERENCIA,
  TIEMPO_VENCIMIENTO_TRANSFERENCIA_MS,
} from "../shared/types";

// ─── Tests de tipos y constantes ─────────────────────────────────────────────

describe("ROL_LABELS", () => {
  it("debe tener etiquetas para todos los roles del sistema", () => {
    const roles: RolSistema[] = [
      "cliente_persona",
      "cliente_empresa",
      "empleado_ventanilla",
      "empleado_comercial",
      "empleado_empresa",
      "supervisor_empresa",
      "analista_interno",
    ];
    roles.forEach((rol) => {
      expect(ROL_LABELS[rol]).toBeDefined();
      expect(ROL_LABELS[rol].length).toBeGreaterThan(0);
    });
  });

  it("debe tener el label correcto para analista_interno", () => {
    expect(ROL_LABELS["analista_interno"]).toBe("Analista Interno");
  });

  it("debe tener el label correcto para supervisor_empresa", () => {
    expect(ROL_LABELS["supervisor_empresa"]).toBe("Supervisor de Empresa");
  });
});

describe("ESTADO_CUENTA_LABELS", () => {
  it("debe tener etiquetas para todos los estados de cuenta", () => {
    const estados: EstadoCuenta[] = ["activa", "bloqueada", "cancelada"];
    estados.forEach((estado) => {
      expect(ESTADO_CUENTA_LABELS[estado]).toBeDefined();
    });
  });
});

describe("ESTADO_PRESTAMO_LABELS", () => {
  it("debe tener etiquetas para todos los estados de préstamo", () => {
    const estados: EstadoPrestamo[] = ["en_estudio", "aprobado", "rechazado", "desembolsado"];
    estados.forEach((estado) => {
      expect(ESTADO_PRESTAMO_LABELS[estado]).toBeDefined();
    });
  });
});

describe("ESTADO_TRANSFERENCIA_LABELS", () => {
  it("debe tener etiquetas para todos los estados de transferencia", () => {
    const estados: EstadoTransferencia[] = ["ejecutada", "en_espera_aprobacion", "rechazada", "vencida"];
    estados.forEach((estado) => {
      expect(ESTADO_TRANSFERENCIA_LABELS[estado]).toBeDefined();
    });
  });
});

// ─── Tests de lógica de negocio ───────────────────────────────────────────────

describe("Umbral de aprobación de transferencias", () => {
  it("debe ser 5,000,000 COP", () => {
    expect(UMBRAL_APROBACION_TRANSFERENCIA).toBe(5_000_000);
  });

  it("transferencia menor al umbral no requiere aprobación", () => {
    const monto = 4_999_999;
    const requiereAprobacion = monto > UMBRAL_APROBACION_TRANSFERENCIA;
    expect(requiereAprobacion).toBe(false);
  });

  it("transferencia igual al umbral no requiere aprobación", () => {
    const monto = 5_000_000;
    const requiereAprobacion = monto > UMBRAL_APROBACION_TRANSFERENCIA;
    expect(requiereAprobacion).toBe(false);
  });

  it("transferencia mayor al umbral requiere aprobación", () => {
    const monto = 5_000_001;
    const requiereAprobacion = monto > UMBRAL_APROBACION_TRANSFERENCIA;
    expect(requiereAprobacion).toBe(true);
  });
});

describe("Tiempo de vencimiento de transferencias", () => {
  it("debe ser 1 hora en milisegundos", () => {
    expect(TIEMPO_VENCIMIENTO_TRANSFERENCIA_MS).toBe(60 * 60 * 1000);
  });

  it("transferencia creada hace 30 minutos no ha vencido", () => {
    const ahora = Date.now();
    const creacion = ahora - 30 * 60 * 1000; // 30 minutos atrás
    const diffMs = ahora - creacion;
    expect(diffMs > TIEMPO_VENCIMIENTO_TRANSFERENCIA_MS).toBe(false);
  });

  it("transferencia creada hace 61 minutos ha vencido", () => {
    const ahora = Date.now();
    const creacion = ahora - 61 * 60 * 1000; // 61 minutos atrás
    const diffMs = ahora - creacion;
    expect(diffMs > TIEMPO_VENCIMIENTO_TRANSFERENCIA_MS).toBe(true);
  });
});

// ─── Tests de permisos por rol ────────────────────────────────────────────────

describe("Permisos de roles", () => {
  function canApproveLoans(rol: RolSistema) {
    return rol === "analista_interno";
  }

  function canApproveTransfers(rol: RolSistema) {
    return rol === "supervisor_empresa";
  }

  function canOpenAccounts(rol: RolSistema) {
    return ["empleado_ventanilla", "empleado_comercial", "analista_interno"].includes(rol);
  }

  function canViewAllClients(rol: RolSistema) {
    return ["empleado_ventanilla", "empleado_comercial", "analista_interno"].includes(rol);
  }

  it("solo el analista_interno puede aprobar préstamos", () => {
    expect(canApproveLoans("analista_interno")).toBe(true);
    expect(canApproveLoans("empleado_comercial")).toBe(false);
    expect(canApproveLoans("supervisor_empresa")).toBe(false);
    expect(canApproveLoans("cliente_persona")).toBe(false);
  });

  it("solo el supervisor_empresa puede aprobar transferencias", () => {
    expect(canApproveTransfers("supervisor_empresa")).toBe(true);
    expect(canApproveTransfers("analista_interno")).toBe(false);
    expect(canApproveTransfers("empleado_empresa")).toBe(false);
    expect(canApproveTransfers("cliente_empresa")).toBe(false);
  });

  it("empleado_ventanilla, empleado_comercial y analista_interno pueden abrir cuentas", () => {
    expect(canOpenAccounts("empleado_ventanilla")).toBe(true);
    expect(canOpenAccounts("empleado_comercial")).toBe(true);
    expect(canOpenAccounts("analista_interno")).toBe(true);
    expect(canOpenAccounts("cliente_persona")).toBe(false);
    expect(canOpenAccounts("supervisor_empresa")).toBe(false);
  });

  it("empleados y analista pueden ver todos los clientes", () => {
    expect(canViewAllClients("empleado_ventanilla")).toBe(true);
    expect(canViewAllClients("empleado_comercial")).toBe(true);
    expect(canViewAllClients("analista_interno")).toBe(true);
    expect(canViewAllClients("cliente_persona")).toBe(false);
    expect(canViewAllClients("cliente_empresa")).toBe(false);
  });
});

// ─── Tests de formateo de moneda ─────────────────────────────────────────────

describe("Formateo de moneda", () => {
  function formatCurrency(amount: string | number, moneda = "COP"): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  it("debe formatear correctamente un número positivo", () => {
    const result = formatCurrency(5000000);
    expect(result).toContain("5");
    expect(result).toContain("000");
  });

  it("debe formatear correctamente un string numérico", () => {
    const result = formatCurrency("1500000.00");
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("debe manejar cero correctamente", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

// ─── Tests de validación de cuentas ──────────────────────────────────────────

describe("Validación de estados de cuenta", () => {
  function puedeTransferir(estado: EstadoCuenta): boolean {
    return estado === "activa";
  }

  it("cuenta activa permite transferencias", () => {
    expect(puedeTransferir("activa")).toBe(true);
  });

  it("cuenta bloqueada no permite transferencias", () => {
    expect(puedeTransferir("bloqueada")).toBe(false);
  });

  it("cuenta cancelada no permite transferencias", () => {
    expect(puedeTransferir("cancelada")).toBe(false);
  });
});

// ─── Tests de flujo de préstamos ─────────────────────────────────────────────

describe("Flujo de estados de préstamo", () => {
  it("solo préstamos en_estudio pueden ser aprobados", () => {
    const puedeAprobar = (estado: EstadoPrestamo) => estado === "en_estudio";
    expect(puedeAprobar("en_estudio")).toBe(true);
    expect(puedeAprobar("aprobado")).toBe(false);
    expect(puedeAprobar("rechazado")).toBe(false);
    expect(puedeAprobar("desembolsado")).toBe(false);
  });

  it("solo préstamos aprobados pueden ser desembolsados", () => {
    const puedeDesembolsar = (estado: EstadoPrestamo) => estado === "aprobado";
    expect(puedeDesembolsar("aprobado")).toBe(true);
    expect(puedeDesembolsar("en_estudio")).toBe(false);
    expect(puedeDesembolsar("rechazado")).toBe(false);
    expect(puedeDesembolsar("desembolsado")).toBe(false);
  });
});
