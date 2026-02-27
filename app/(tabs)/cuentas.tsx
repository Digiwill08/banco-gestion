import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  ConfirmModal,
  EmptyState,
  FormField,
  ListItem,
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  formatCurrency,
  formatDate,
} from "@/components/bank-ui";
import { useBankAuth, canOpenAccounts } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { TIPO_CUENTA_LABELS, TipoCuenta } from "@/shared/types";

const TIPOS_CUENTA: { value: TipoCuenta; label: string }[] = [
  { value: "ahorros", label: "Cuenta de Ahorros" },
  { value: "corriente", label: "Cuenta Corriente" },
  { value: "personal", label: "Cuenta Personal" },
  { value: "empresarial", label: "Cuenta Empresarial" },
];

export default function CuentasScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState<{ cuenta: any; action: "bloqueada" | "cancelada" | "activa" } | null>(null);

  // Formulario nueva cuenta
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>("ahorros");
  const [idTitular, setIdTitular] = useState("");
  const [moneda, setMoneda] = useState<"COP" | "USD" | "EUR">("COP");

  const isEmployee = canOpenAccounts(user?.rolSistema ?? "cliente_persona");

  // Queries
  const cuentasQuery = isEmployee
    ? trpc.cuentas.listAll.useQuery()
    : trpc.cuentas.listByTitular.useQuery(
        { idTitular: user?.idIdentificacion ?? "" },
        { enabled: !!user }
      );

  const historialQuery = trpc.cuentas.historial.useQuery(
    { numeroCuenta: selectedCuenta?.numeroCuenta ?? "" },
    { enabled: !!selectedCuenta }
  );

  const createMutation = trpc.cuentas.create.useMutation({
    onSuccess: () => {
      utils.cuentas.listAll.invalidate();
      utils.cuentas.listByTitular.invalidate();
      setShowCreate(false);
      setIdTitular("");
      setTipoCuenta("ahorros");
      Alert.alert("Éxito", "Cuenta creada exitosamente");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const updateEstadoMutation = trpc.cuentas.updateEstado.useMutation({
    onSuccess: () => {
      utils.cuentas.listAll.invalidate();
      utils.cuentas.listByTitular.invalidate();
      setConfirmBlock(null);
      setShowDetail(false);
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const handleCreate = () => {
    if (!idTitular.trim()) {
      Alert.alert("Error", "El ID del titular es requerido");
      return;
    }
    createMutation.mutate({
      tipoCuenta,
      idTitular: idTitular.trim(),
      moneda,
      abiertaPorId: user?.id,
    });
  };

  const cuentas = cuentasQuery.data ?? [];

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Cuentas Bancarias"
        subtitle={isEmployee ? `${cuentas.length} cuentas registradas` : "Mis cuentas"}
        action={isEmployee ? { icon: "➕", onPress: () => setShowCreate(true) } : undefined}
      />

      {cuentasQuery.isLoading ? (
        <LoadingOverlay />
      ) : !cuentas.length ? (
        <EmptyState
          icon="💳"
          title="Sin cuentas"
          subtitle={isEmployee ? "No hay cuentas registradas" : "No tienes cuentas bancarias"}
          action={isEmployee ? { label: "Abrir Cuenta", onPress: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <FlatList
          data={cuentas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setSelectedCuenta(item); setShowDetail(true); }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                borderRadius: 14,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#D1DCE8",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#5C7A99", fontWeight: "500" }}>
                    {TIPO_CUENTA_LABELS[item.tipoCuenta as TipoCuenta] ?? item.tipoCuenta}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#0D1B2A", marginTop: 2 }}>
                    •••• {item.numeroCuenta.slice(-4)}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#5C7A99", marginTop: 2 }}>
                    {item.numeroCuenta}
                  </Text>
                </View>
                <StatusBadge type="cuenta" value={item.estadoCuenta} />
              </View>
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: "#1A3A5C" }}>
                  {formatCurrency(item.saldoActual, item.moneda)}
                </Text>
                <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 2 }}>
                  Titular: {item.idTitular} · Desde {formatDate(item.fechaApertura)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Modal: Crear cuenta */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
          <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Abrir Nueva Cuenta</Text>
              <Pressable onPress={() => setShowCreate(false)}>
                <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <FormField
              label="ID del Titular"
              value={idTitular}
              onChangeText={setIdTitular}
              placeholder="Ej: CC12345678 o NIT900123456"
              autoCapitalize="characters"
              required
            />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 8 }}>
              Tipo de Cuenta <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TIPOS_CUENTA.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setTipoCuenta(t.value)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: tipoCuenta === t.value ? "#1A3A5C" : "#FFFFFF",
                    borderWidth: 1.5,
                    borderColor: tipoCuenta === t.value ? "#1A3A5C" : "#D1DCE8",
                  }}
                >
                  <Text style={{ color: tipoCuenta === t.value ? "#FFFFFF" : "#5C7A99", fontWeight: "600", fontSize: 13 }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 8 }}>
              Moneda
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              {(["COP", "USD", "EUR"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMoneda(m)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: moneda === m ? "#1A3A5C" : "#FFFFFF",
                    borderWidth: 1.5,
                    borderColor: moneda === m ? "#1A3A5C" : "#D1DCE8",
                  }}
                >
                  <Text style={{ color: moneda === m ? "#FFFFFF" : "#5C7A99", fontWeight: "700" }}>{m}</Text>
                </Pressable>
              ))}
            </View>

            <PrimaryButton
              label="Abrir Cuenta"
              onPress={handleCreate}
              loading={createMutation.isPending}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Detalle de cuenta */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedCuenta && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Detalle de Cuenta</Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Info principal */}
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#0D1B2A" }}>
                    {TIPO_CUENTA_LABELS[selectedCuenta.tipoCuenta as TipoCuenta]}
                  </Text>
                  <StatusBadge type="cuenta" value={selectedCuenta.estadoCuenta} />
                </View>
                {[
                  { label: "Número de Cuenta", value: selectedCuenta.numeroCuenta },
                  { label: "Titular", value: selectedCuenta.idTitular },
                  { label: "Saldo Actual", value: formatCurrency(selectedCuenta.saldoActual, selectedCuenta.moneda) },
                  { label: "Moneda", value: selectedCuenta.moneda },
                  { label: "Fecha de Apertura", value: formatDate(selectedCuenta.fechaApertura) },
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                    <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600" }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Acciones (solo empleados/analistas) */}
              {isEmployee && (
                <View style={{ gap: 10, marginBottom: 20 }}>
                  {selectedCuenta.estadoCuenta !== "bloqueada" && selectedCuenta.estadoCuenta !== "cancelada" && (
                    <PrimaryButton
                      label="Bloquear Cuenta"
                      onPress={() => setConfirmBlock({ cuenta: selectedCuenta, action: "bloqueada" })}
                      variant="danger"
                    />
                  )}
                  {selectedCuenta.estadoCuenta === "bloqueada" && (
                    <PrimaryButton
                      label="Activar Cuenta"
                      onPress={() => setConfirmBlock({ cuenta: selectedCuenta, action: "activa" })}
                      variant="secondary"
                    />
                  )}
                  {selectedCuenta.estadoCuenta !== "cancelada" && (
                    <PrimaryButton
                      label="Cancelar Cuenta"
                      onPress={() => setConfirmBlock({ cuenta: selectedCuenta, action: "cancelada" })}
                      variant="danger"
                    />
                  )}
                </View>
              )}

              {/* Historial de transferencias */}
              <SectionHeader title="Historial de Movimientos" />
              {historialQuery.isLoading ? (
                <LoadingOverlay message="Cargando movimientos..." />
              ) : !historialQuery.data?.length ? (
                <EmptyState icon="📄" title="Sin movimientos" subtitle="No hay transferencias registradas para esta cuenta" />
              ) : (
                historialQuery.data.slice(0, 10).map((t) => (
                  <View key={t.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#D1DCE8" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#0D1B2A" }}>
                        {t.cuentaOrigen === selectedCuenta.numeroCuenta ? "Débito" : "Crédito"}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: t.cuentaOrigen === selectedCuenta.numeroCuenta ? "#DC2626" : "#16A34A",
                      }}>
                        {t.cuentaOrigen === selectedCuenta.numeroCuenta ? "-" : "+"}{formatCurrency(t.monto)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 4 }}>
                      {t.cuentaOrigen === selectedCuenta.numeroCuenta
                        ? `→ ${t.cuentaDestino}`
                        : `← ${t.cuentaOrigen}`
                      } · {formatDate(t.fechaCreacion)}
                    </Text>
                    <StatusBadge type="transferencia" value={t.estadoTransferencia} />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Confirm Modal */}
      {confirmBlock && (
        <ConfirmModal
          visible={!!confirmBlock}
          title={confirmBlock.action === "bloqueada" ? "Bloquear Cuenta" : confirmBlock.action === "cancelada" ? "Cancelar Cuenta" : "Activar Cuenta"}
          message={
            confirmBlock.action === "bloqueada"
              ? `¿Deseas bloquear la cuenta ${confirmBlock.cuenta.numeroCuenta}? No se podrán realizar operaciones hasta que sea desbloqueada.`
              : confirmBlock.action === "cancelada"
              ? `¿Deseas cancelar permanentemente la cuenta ${confirmBlock.cuenta.numeroCuenta}? Esta acción no se puede deshacer.`
              : `¿Deseas activar la cuenta ${confirmBlock.cuenta.numeroCuenta}?`
          }
          confirmLabel={confirmBlock.action === "bloqueada" ? "Bloquear" : confirmBlock.action === "cancelada" ? "Cancelar Cuenta" : "Activar"}
          destructive={confirmBlock.action !== "activa"}
          loading={updateEstadoMutation.isPending}
          onConfirm={() =>
            updateEstadoMutation.mutate({
              numeroCuenta: confirmBlock.cuenta.numeroCuenta,
              estado: confirmBlock.action,
            })
          }
          onCancel={() => setConfirmBlock(null)}
        />
      )}
    </ScreenContainer>
  );
}
