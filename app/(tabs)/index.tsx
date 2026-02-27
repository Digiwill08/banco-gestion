import { router } from "expo-router";
import { Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useBankAuth } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { ROL_LABELS, RolSistema } from "@/shared/types";
import {
  EmptyState,
  InfoCard,
  ListItem,
  LoadingOverlay,
  SectionHeader,
  StatusBadge,
  formatCurrency,
  formatDate,
} from "@/components/bank-ui";

function RoleIcon({ rol }: { rol: RolSistema }) {
  const icons: Record<RolSistema, string> = {
    cliente_persona: "👤",
    cliente_empresa: "🏢",
    empleado_ventanilla: "🏦",
    empleado_comercial: "💼",
    empleado_empresa: "⚙️",
    supervisor_empresa: "🔍",
    analista_interno: "📊",
  };
  return <Text style={{ fontSize: 32 }}>{icons[rol]}</Text>;
}

// ─── Dashboard Cliente Persona Natural ───────────────────────────────────────
function DashboardClientePersona() {
  const { user } = useBankAuth();
  const { data: cuentas, isLoading } = trpc.cuentas.listByTitular.useQuery(
    { idTitular: user?.idIdentificacion ?? "" },
    { enabled: !!user }
  );
  const { data: prestamos } = trpc.prestamos.listByCliente.useQuery(
    { idClienteSolicitante: user?.idIdentificacion ?? "" },
    { enabled: !!user }
  );

  if (isLoading) return <LoadingOverlay />;

  const totalSaldo = cuentas?.reduce((sum, c) => sum + parseFloat(c.saldoActual), 0) ?? 0;
  const prestamosActivos = prestamos?.filter((p) => p.estadoPrestamo === "aprobado" || p.estadoPrestamo === "en_estudio") ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {/* Resumen financiero */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <InfoCard label="Saldo Total" value={formatCurrency(totalSaldo)} subtitle="Todas las cuentas" accent />
        <InfoCard label="Cuentas Activas" value={String(cuentas?.filter((c) => c.estadoCuenta === "activa").length ?? 0)} subtitle="Cuentas" />
      </View>

      {/* Acciones rápidas */}
      <SectionHeader title="Acciones Rápidas" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {[
          { icon: "↔️", label: "Transferir", route: "/(tabs)/transferencias" as const },
          { icon: "💰", label: "Solicitar Préstamo", route: "/(tabs)/prestamos" as const },
          { icon: "💳", label: "Mis Cuentas", route: "/(tabs)/cuentas" as const },
        ].map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(action.route)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              flex: 1,
              minWidth: 90,
              borderWidth: 1,
              borderColor: "#D1DCE8",
            })}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A3A5C", textAlign: "center" }}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Mis cuentas */}
      <SectionHeader
        title="Mis Cuentas"
        action={{ label: "Ver todas", onPress: () => router.push("/(tabs)/cuentas") }}
      />
      {!cuentas?.length ? (
        <EmptyState icon="💳" title="Sin cuentas" subtitle="No tienes cuentas bancarias registradas" />
      ) : (
        cuentas.slice(0, 3).map((cuenta) => (
          <ListItem
            key={cuenta.id}
            icon="💳"
            title={`•••• ${cuenta.numeroCuenta.slice(-4)}`}
            subtitle={`${cuenta.tipoCuenta.charAt(0).toUpperCase() + cuenta.tipoCuenta.slice(1)} · ${formatCurrency(cuenta.saldoActual)}`}
            right={<StatusBadge type="cuenta" value={cuenta.estadoCuenta} />}
            onPress={() => router.push(`/(tabs)/cuentas` as any)}
          />
        ))
      )}

      {/* Préstamos activos */}
      {prestamosActivos.length > 0 && (
        <>
          <SectionHeader
            title="Préstamos Activos"
            action={{ label: "Ver todos", onPress: () => router.push("/(tabs)/prestamos") }}
          />
          {prestamosActivos.slice(0, 2).map((p) => (
            <ListItem
              key={p.id}
              icon="💰"
              title={`Préstamo ${p.tipoPrestamo}`}
              subtitle={`Solicitado: ${formatCurrency(p.montoSolicitado)}`}
              right={<StatusBadge type="prestamo" value={p.estadoPrestamo} />}
              onPress={() => router.push("/(tabs)/prestamos" as any)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ─── Dashboard Empleado Ventanilla ────────────────────────────────────────────
function DashboardEmpleadoVentanilla() {
  const { data: cuentas, isLoading } = trpc.cuentas.listAll.useQuery();
  const cuentasActivas = cuentas?.filter((c) => c.estadoCuenta === "activa") ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <InfoCard label="Cuentas Activas" value={String(cuentasActivas.length)} subtitle="En el sistema" accent />
        <InfoCard label="Total Cuentas" value={String(cuentas?.length ?? 0)} subtitle="Registradas" />
      </View>

      <SectionHeader title="Acciones Rápidas" />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Pressable
          onPress={() => router.push("/(tabs)/clientes")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>👥</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Buscar Cliente</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/cuentas")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>💳</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Abrir Cuenta</Text>
        </Pressable>
      </View>

      <SectionHeader title="Últimas Cuentas" />
      {isLoading ? (
        <LoadingOverlay />
      ) : cuentas?.slice(0, 5).map((cuenta) => (
        <ListItem
          key={cuenta.id}
          icon="💳"
          title={cuenta.numeroCuenta}
          subtitle={`Titular: ${cuenta.idTitular} · ${formatCurrency(cuenta.saldoActual)}`}
          right={<StatusBadge type="cuenta" value={cuenta.estadoCuenta} />}
        />
      ))}
    </ScrollView>
  );
}

// ─── Dashboard Empleado Comercial ─────────────────────────────────────────────
function DashboardEmpleadoComercial() {
  const { data: prestamos, isLoading } = trpc.prestamos.listAll.useQuery();
  const pendientes = prestamos?.filter((p) => p.estadoPrestamo === "en_estudio") ?? [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <InfoCard label="Préstamos Pendientes" value={String(pendientes.length)} subtitle="En estudio" accent />
        <InfoCard label="Total Préstamos" value={String(prestamos?.length ?? 0)} subtitle="Registrados" />
      </View>

      <SectionHeader title="Acciones Rápidas" />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Pressable
          onPress={() => router.push("/(tabs)/clientes")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>👥</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Clientes</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/prestamos")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>💰</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Nuevo Préstamo</Text>
        </Pressable>
      </View>

      <SectionHeader title="Préstamos Recientes" />
      {isLoading ? <LoadingOverlay /> : prestamos?.slice(0, 5).map((p) => (
        <ListItem
          key={p.id}
          icon="💰"
          title={`Préstamo #${p.id} — ${p.tipoPrestamo}`}
          subtitle={`Cliente: ${p.idClienteSolicitante} · ${formatCurrency(p.montoSolicitado)}`}
          right={<StatusBadge type="prestamo" value={p.estadoPrestamo} />}
        />
      ))}
    </ScrollView>
  );
}

// ─── Dashboard Analista Interno ───────────────────────────────────────────────
function DashboardAnalistaInterno() {
  const { data: prestamos } = trpc.prestamos.listPendientes.useQuery();
  const { data: allPrestamos } = trpc.prestamos.listAll.useQuery();
  const { data: bitacora } = trpc.bitacora.listAll.useQuery();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <InfoCard label="Préstamos Pendientes" value={String(prestamos?.length ?? 0)} subtitle="En estudio" accent />
        <InfoCard label="Total Préstamos" value={String(allPrestamos?.length ?? 0)} subtitle="Registrados" />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <InfoCard label="Operaciones Bitácora" value={String(bitacora?.length ?? 0)} subtitle="Registradas" />
      </View>

      <SectionHeader title="Préstamos para Revisar" action={{ label: "Ver todos", onPress: () => router.push("/(tabs)/prestamos") }} />
      {!prestamos?.length ? (
        <EmptyState icon="✅" title="Sin préstamos pendientes" subtitle="No hay préstamos en estudio actualmente" />
      ) : (
        prestamos.slice(0, 5).map((p) => (
          <ListItem
            key={p.id}
            icon="💰"
            title={`Préstamo #${p.id}`}
            subtitle={`${p.idClienteSolicitante} · ${formatCurrency(p.montoSolicitado)} · ${p.tipoPrestamo}`}
            right={<StatusBadge type="prestamo" value={p.estadoPrestamo} />}
            onPress={() => router.push("/(tabs)/prestamos" as any)}
          />
        ))
      )}

      <SectionHeader title="Acciones" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          { icon: "👥", label: "Clientes", route: "/(tabs)/clientes" as const },
          { icon: "💰", label: "Préstamos", route: "/(tabs)/prestamos" as const },
          { icon: "📋", label: "Bitácora", route: "/(tabs)/bitacora" as const },
        ].map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.route)}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 90,
              backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#D1DCE8",
            })}
          >
            <Text style={{ fontSize: 26, marginBottom: 4 }}>{a.icon}</Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A3A5C" }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Dashboard Supervisor Empresa ─────────────────────────────────────────────
function DashboardSupervisorEmpresa() {
  const { data: transferencias } = trpc.transferencias.listEnEspera.useQuery();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <InfoCard label="Transferencias Pendientes" value={String(transferencias?.length ?? 0)} subtitle="En espera" accent />
      </View>

      <SectionHeader title="Transferencias para Aprobar" action={{ label: "Ver todas", onPress: () => router.push("/(tabs)/aprobaciones") }} />
      {!transferencias?.length ? (
        <EmptyState icon="✅" title="Sin transferencias pendientes" subtitle="No hay transferencias en espera de aprobación" />
      ) : (
        transferencias.slice(0, 5).map((t) => (
          <ListItem
            key={t.id}
            icon="↔️"
            title={`Transferencia #${t.id}`}
            subtitle={`${t.cuentaOrigen} → ${t.cuentaDestino} · ${formatCurrency(t.monto)}`}
            right={<StatusBadge type="transferencia" value={t.estadoTransferencia} />}
            onPress={() => router.push("/(tabs)/aprobaciones" as any)}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Dashboard Empleado/Cliente Empresa ───────────────────────────────────────
function DashboardEmpresa() {
  const { user } = useBankAuth();
  const { data: transferencias } = trpc.transferencias.listByUsuario.useQuery(
    { idUsuarioCreador: user?.id ?? 0 },
    { enabled: !!user }
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <SectionHeader title="Acciones Rápidas" />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Pressable
          onPress={() => router.push("/(tabs)/cuentas")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>💳</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Cuentas</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/transferencias")}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: pressed ? "#E2EBF4" : "#EEF4FB",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          })}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>↔️</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A3A5C" }}>Transferir</Text>
        </Pressable>
      </View>

      <SectionHeader title="Mis Transferencias Recientes" />
      {!transferencias?.length ? (
        <EmptyState icon="↔️" title="Sin transferencias" subtitle="No has realizado transferencias aún" />
      ) : (
        transferencias.slice(0, 5).map((t) => (
          <ListItem
            key={t.id}
            icon="↔️"
            title={`${t.cuentaOrigen} → ${t.cuentaDestino}`}
            subtitle={`${formatCurrency(t.monto)} · ${formatDate(t.fechaCreacion)}`}
            right={<StatusBadge type="transferencia" value={t.estadoTransferencia} />}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user, logout } = useBankAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.rolSistema) {
      case "cliente_persona": return <DashboardClientePersona />;
      case "cliente_empresa": return <DashboardEmpresa />;
      case "empleado_empresa": return <DashboardEmpresa />;
      case "empleado_ventanilla": return <DashboardEmpleadoVentanilla />;
      case "empleado_comercial": return <DashboardEmpleadoComercial />;
      case "supervisor_empresa": return <DashboardSupervisorEmpresa />;
      case "analista_interno": return <DashboardAnalistaInterno />;
      default: return <EmptyState icon="🏦" title="Panel no disponible" />;
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1A3A5C",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: "#A8C4E0", fontWeight: "500" }}>
            {ROL_LABELS[user.rolSistema]}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF", marginTop: 2 }}>
            Hola, {user.nombreCompleto.split(" ")[0]} 👋
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Alert.alert("Cerrar Sesión", "¿Deseas cerrar tu sesión?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Salir", style: "destructive", onPress: logout },
            ]);
          }}
          style={{ padding: 8 }}
        >
          <Text style={{ fontSize: 22 }}>🚪</Text>
        </Pressable>
      </View>

      {renderDashboard()}
    </ScreenContainer>
  );
}
