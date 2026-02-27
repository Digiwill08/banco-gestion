import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  EmptyState,
  FormField,
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  StatusBadge,
  formatCurrency,
  formatDate,
} from "@/components/bank-ui";
import { useBankAuth, canCreateTransfers } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { UMBRAL_APROBACION_TRANSFERENCIA } from "@/shared/types";

export default function TransferenciasScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const canCreate = canCreateTransfers(user?.rolSistema ?? "cliente_persona");
  const esEmpresarial = ["cliente_empresa", "empleado_empresa", "supervisor_empresa"].includes(user?.rolSistema ?? "");

  const [showCreate, setShowCreate] = useState(false);
  const [cuentaOrigen, setCuentaOrigen] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");

  const transferenciasQuery = trpc.transferencias.listByUsuario.useQuery(
    { idUsuarioCreador: user?.id ?? 0 },
    { enabled: !!user }
  );

  const createMutation = trpc.transferencias.create.useMutation({
    onSuccess: (data) => {
      utils.transferencias.listByUsuario.invalidate();
      utils.cuentas.listByTitular.invalidate();
      utils.cuentas.listAll.invalidate();
      setShowCreate(false);
      setCuentaOrigen("");
      setCuentaDestino("");
      setMonto("");
      setConcepto("");
      if (data.estado === "en_espera_aprobacion") {
        Alert.alert(
          "Transferencia en Espera",
          "La transferencia supera el umbral permitido y requiere aprobación del supervisor de empresa.",
          [{ text: "Entendido" }]
        );
      } else {
        Alert.alert("Éxito", "Transferencia ejecutada exitosamente");
      }
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const handleCreate = () => {
    const montoNum = parseFloat(monto.replace(/[^0-9.]/g, ""));
    if (!cuentaOrigen.trim()) { Alert.alert("Error", "La cuenta origen es requerida"); return; }
    if (!cuentaDestino.trim()) { Alert.alert("Error", "La cuenta destino es requerida"); return; }
    if (isNaN(montoNum) || montoNum <= 0) { Alert.alert("Error", "El monto debe ser mayor a 0"); return; }

    if (esEmpresarial && montoNum > UMBRAL_APROBACION_TRANSFERENCIA) {
      Alert.alert(
        "Confirmación",
        `Esta transferencia de ${formatCurrency(montoNum)} supera el umbral de ${formatCurrency(UMBRAL_APROBACION_TRANSFERENCIA)} y requerirá aprobación del supervisor. ¿Deseas continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Continuar",
            onPress: () => createMutation.mutate({
              cuentaOrigen: cuentaOrigen.trim(),
              cuentaDestino: cuentaDestino.trim(),
              monto: montoNum,
              concepto: concepto.trim() || undefined,
              idUsuarioCreador: user?.id ?? 0,
              esEmpresarial: true,
            }),
          },
        ]
      );
    } else {
      createMutation.mutate({
        cuentaOrigen: cuentaOrigen.trim(),
        cuentaDestino: cuentaDestino.trim(),
        monto: montoNum,
        concepto: concepto.trim() || undefined,
        idUsuarioCreador: user?.id ?? 0,
        esEmpresarial,
      });
    }
  };

  const transferencias = transferenciasQuery.data ?? [];

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Transferencias"
        subtitle="Historial de movimientos"
        action={canCreate ? { icon: "➕", onPress: () => setShowCreate(true) } : undefined}
      />

      {transferenciasQuery.isLoading ? (
        <LoadingOverlay />
      ) : !transferencias.length ? (
        <EmptyState
          icon="↔️"
          title="Sin transferencias"
          subtitle="No has realizado transferencias aún"
          action={canCreate ? { label: "Nueva Transferencia", onPress: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <FlatList
          data={transferencias}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#D1DCE8",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#5C7A99", fontWeight: "500" }}>
                    {item.cuentaOrigen} → {item.cuentaDestino}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginTop: 4 }}>
                    {formatCurrency(item.monto)}
                  </Text>
                  {item.concepto && (
                    <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 2 }}>
                      {item.concepto}
                    </Text>
                  )}
                </View>
                <StatusBadge type="transferencia" value={item.estadoTransferencia} />
              </View>
              <Text style={{ fontSize: 11, color: "#9BA8B5", marginTop: 8 }}>
                {formatDate(item.fechaCreacion)}
                {item.fechaAprobacion ? ` · Aprobado: ${formatDate(item.fechaAprobacion)}` : ""}
              </Text>
            </View>
          )}
        />
      )}

      {/* Modal: Nueva transferencia */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
          <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Nueva Transferencia</Text>
              <Pressable onPress={() => setShowCreate(false)}>
                <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {esEmpresarial && (
              <View style={{ backgroundColor: "#FEF9C3", borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#FDE68A" }}>
                <Text style={{ fontSize: 13, color: "#D97706", fontWeight: "600" }}>
                  ⚠️ Transferencias empresariales superiores a {formatCurrency(UMBRAL_APROBACION_TRANSFERENCIA)} requieren aprobación del supervisor.
                </Text>
              </View>
            )}

            <FormField
              label="Cuenta Origen"
              value={cuentaOrigen}
              onChangeText={setCuentaOrigen}
              placeholder="Número de cuenta origen"
              keyboardType="numeric"
              required
            />
            <FormField
              label="Cuenta Destino"
              value={cuentaDestino}
              onChangeText={setCuentaDestino}
              placeholder="Número de cuenta destino"
              keyboardType="numeric"
              required
            />
            <FormField
              label="Monto (COP)"
              value={monto}
              onChangeText={setMonto}
              placeholder="Ej: 500000"
              keyboardType="numeric"
              required
            />
            <FormField
              label="Concepto (opcional)"
              value={concepto}
              onChangeText={setConcepto}
              placeholder="Descripción de la transferencia"
            />

            <PrimaryButton
              label="Realizar Transferencia"
              onPress={handleCreate}
              loading={createMutation.isPending}
            />
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
