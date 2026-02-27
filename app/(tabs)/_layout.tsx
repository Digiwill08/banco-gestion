import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Text } from "react-native";
import { useBankAuth } from "@/lib/bank-auth-context";
import { RolSistema } from "@/shared/types";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function getTabsForRole(rol: RolSistema) {
  switch (rol) {
    case "cliente_persona":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "cuentas", title: "Cuentas", icon: "💳" },
        { name: "prestamos", title: "Préstamos", icon: "💰" },
        { name: "transferencias", title: "Transferencias", icon: "↔️" },
      ];
    case "cliente_empresa":
    case "empleado_empresa":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "cuentas", title: "Cuentas", icon: "💳" },
        { name: "transferencias", title: "Transferencias", icon: "↔️" },
        { name: "perfil", title: "Perfil", icon: "👤" },
      ];
    case "supervisor_empresa":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "cuentas", title: "Cuentas", icon: "💳" },
        { name: "aprobaciones", title: "Aprobaciones", icon: "✅" },
        { name: "perfil", title: "Perfil", icon: "👤" },
      ];
    case "empleado_ventanilla":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "clientes", title: "Clientes", icon: "👥" },
        { name: "cuentas", title: "Cuentas", icon: "💳" },
        { name: "perfil", title: "Perfil", icon: "👤" },
      ];
    case "empleado_comercial":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "clientes", title: "Clientes", icon: "👥" },
        { name: "prestamos", title: "Préstamos", icon: "💰" },
        { name: "perfil", title: "Perfil", icon: "👤" },
      ];
    case "analista_interno":
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "clientes", title: "Clientes", icon: "👥" },
        { name: "prestamos", title: "Préstamos", icon: "💰" },
        { name: "bitacora", title: "Bitácora", icon: "📋" },
      ];
    default:
      return [
        { name: "index", title: "Inicio", icon: "🏠" },
        { name: "perfil", title: "Perfil", icon: "👤" },
      ];
  }
}

// Todas las tabs posibles para registrar en el Stack
const ALL_TABS = ["index", "cuentas", "prestamos", "transferencias", "clientes", "aprobaciones", "bitacora", "perfil", "usuarios"];

export default function TabLayout() {
  const { user, isAuthenticated, loading } = useBankAuth();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login" as any);
    }
  }, [loading, isAuthenticated]);

  if (!user) return null;

  const tabs = getTabsForRole(user.rolSistema);
  const activeTabNames = new Set(tabs.map((t) => t.name));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D1DCE8",
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: "#1A3A5C",
        tabBarInactiveTintColor: "#9BA8B5",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      {ALL_TABS.map((tabName) => {
        const tabConfig = tabs.find((t) => t.name === tabName);
        const isVisible = activeTabNames.has(tabName);
        return (
          <Tabs.Screen
            key={tabName}
            name={tabName}
            options={{
              title: tabConfig?.title ?? tabName,
              tabBarIcon: ({ focused }) =>
                tabConfig ? <TabIcon emoji={tabConfig.icon} focused={focused} /> : null,
              href: isVisible ? undefined : null,
            }}
          />
        );
      })}
    </Tabs>
  );
}
