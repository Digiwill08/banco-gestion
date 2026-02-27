import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { RolSistema } from "@/shared/types";

export interface BankUserSession {
  id: number;
  nombreCompleto: string;
  idIdentificacion: string;
  correoElectronico: string;
  telefono: string;
  direccion: string;
  rolSistema: RolSistema;
  estadoUsuario: string;
  empresaId: number | null;
  fechaNacimiento: string | null;
}

interface BankAuthContextType {
  user: BankUserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: BankUserSession) => Promise<void>;
  logout: () => Promise<void>;
}

const BankAuthContext = createContext<BankAuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const STORAGE_KEY = "banco_gestion_session";

export function BankAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BankUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            setUser(JSON.parse(data));
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (userData: BankUserSession) => {
    setUser(userData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <BankAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </BankAuthContext.Provider>
  );
}

export function useBankAuth() {
  return useContext(BankAuthContext);
}

// Helpers de permisos por rol
export function canViewAllClients(rol: RolSistema) {
  return ["empleado_ventanilla", "empleado_comercial", "analista_interno"].includes(rol);
}

export function canApproveLoans(rol: RolSistema) {
  return rol === "analista_interno";
}

export function canApproveTransfers(rol: RolSistema) {
  return rol === "supervisor_empresa";
}

export function canCreateTransfers(rol: RolSistema) {
  return ["cliente_persona", "cliente_empresa", "empleado_empresa", "supervisor_empresa"].includes(rol);
}

export function canOpenAccounts(rol: RolSistema) {
  return ["empleado_ventanilla", "empleado_comercial", "analista_interno"].includes(rol);
}

export function canViewAuditLog(rol: RolSistema) {
  return rol === "analista_interno";
}

export function canManageUsers(rol: RolSistema) {
  return rol === "analista_interno";
}
