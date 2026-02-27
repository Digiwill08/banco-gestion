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
  ConfirmModal,
  EmptyState,
  FormField,
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  StatusBadge,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/components/bank-ui";
import { useBankAuth } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { UMBRAL_APROBACION_TRANSFERENCIA } from "@/shared/types";

export default function AprobacionesScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const [selectedTransferencia, setSelectedTransferencia] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);

  const transferenciasQuery = trpc.transferencias.listEnEspera.useQuery();

  const verificarVencidasMutation = trpc.transferencias.verificarVencidas.useMutation({
    onSuccess: (data) => {
      utils.transferencias.listEnEspera.invalidate();
      if (data.vencidas > 0) {
        Alert.alert("Verificación", `Se marcaron ${data.vencidas} transferencia(s) como vencidas`);
      } else {
        Alert.alert("Verificación", "No hay transferencias vencidas");
      }
    },
  });

  const aprobarMutation = trpc.transferencias.aprobar.useMutation({
    onSuccess: () => {
      utils.transferencias.listEnEspera.invalidate();
      utils.cuentas.listAll.invalidate();
      setConfirmApprove(false);
      setShowDetail(false);
      Alert.alert("Éxito", "Transferencia aprobada y ejecutada exitosamente");
    },
    onError: (err) => {
      setConfirmApprove(false);
      Alert.alert("Error", err.message);
    },
  });

  const rechazarMutation = trpc.transferencias.rechazar.useMutation({
    onSuccess: () => {
      utils.transferencias.listEnEspera.invalidate();
      setShowRejectModal(false);
      setShowDetail(false);
      setMotivoRechazo("");
      Alert.alert("Éxito", "Transferencia rechazada");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const transferencias = transferenciasQuery.data ?? [];

  // Calcular tiempo restante para cada transferencia
  const getTimeRemaining = (fechaCreacion: string | Date) => {
    const creacion = new Date(fechaCreacion);
    const ahora = new Date();
    const diffMs = 60 * 60 * 1000 - (ahora.getTime() - creacion.getTime());
    if (diffMs <= 0) return "VENCIDA";
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Aprobaciones"
        subtitle={`${transferencias.length} transferencia(s) en espera`}
        action={{ icon: "🔄", onPress: () => verificarVencidasMutation.mutate() }}
      />

      {/* Aviso umbral */}
      <View style={{ margin: 16, backgroundColor: "#FEF9C3", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#FDE68A" }}>
        <Text style={{ fontSize: 13, color: "#D97706", fontWeight: "600" }}>
          ⚠️ Umbral de aprobación: {formatCurrency(UMBRAL_APROBACION_TRANSFERENCIA)}
        </Text>
        <Text style={{ fontSize: 12, color: "#D97706", marginTop: 4 }}>
          Las transferencias tienen 1 hora para ser aprobadas. Pasado ese tiempo se marcan como vencidas.
        </Text>
      </View>

      {transferenciasQuery.isLoading ? (
        <LoadingOverlay />
      ) : !transferencias.length ? (
        <EmptyState
          icon="✅"
          title="Sin transferencias pendientes"
          subtitle="No hay transferencias en espera de aprobación"
        />
      ) : (
        <FlatList
          data={transferencias}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => {
            const timeLeft = getTimeRemaining(item.fechaCreacion);
            const isExpiring = timeLeft !== "VENCIDA" && parseInt(timeLeft) < 10;

            return (
              <Pressable
                onPress={() => { setSelectedTransferencia(item); setShowDetail(true); }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: timeLeft === "VENCIDA" ? "#FCA5A5" : isExpiring ? "#FDE68A" : "#D1DCE8",
                })}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: "#5C7A99", fontWeight: "500" }}>
                      Transferencia #{item.id}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginTop: 4 }}>
                      {formatCurrency(item.monto)}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 2 }}>
                      {item.cuentaOrigen} → {item.cuentaDestino}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge type="transferencia" value={item.estadoTransferencia} />
                    <View style={{ backgroundColor: timeLeft === "VENCIDA" ? "#FEE2E2" : "#FEF9C3", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: timeLeft === "VENCIDA" ? "#DC2626" : "#D97706" }}>
                        ⏱ {timeLeft}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: "#9BA8B5", marginTop: 8 }}>
                  Creada: {formatDateTime(item.fechaCreacion)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      {/* Modal: Detalle transferencia */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedTransferencia && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
                  Transferencia #{selectedTransferencia.id}
                </Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Tiempo restante */}
              {(() => {
                const timeLeft = getTimeRemaining(selectedTransferencia.fechaCreacion);
                return (
                  <View style={{
                    backgroundColor: timeLeft === "VENCIDA" ? "#FEE2E2" : "#FEF9C3",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                    alignItems: "center",
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: timeLeft === "VENCIDA" ? "#DC2626" : "#D97706" }}>
                      ⏱ Tiempo restante: {timeLeft}
                    </Text>
                    {timeLeft === "VENCIDA" && (
                      <Text style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>
                        Esta transferencia ha vencido y no puede ser aprobada
                      </Text>
                    )}
                  </View>
                );
              })()}

              {/* Detalles */}
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
                {[
                  { label: "Monto", value: formatCurrency(selectedTransferencia.monto) },
                  { label: "Cuenta Origen", value: selectedTransferencia.cuentaOrigen },
                  { label: "Cuenta Destino", value: selectedTransferencia.cuentaDestino },
                  { label: "Concepto", value: selectedTransferencia.concepto ?? "Sin concepto" },
                  { label: "Creada por (ID)", value: String(selectedTransferencia.idUsuarioCreador) },
                  { label: "Fecha Creación", value: formatDateTime(selectedTransferencia.fechaCreacion) },
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                    <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Acciones */}
              {getTimeRemaining(selectedTransferencia.fechaCreacion) !== "VENCIDA" && (
                <View style={{ gap: 10 }}>
                  <PrimaryButton
                    label="✅ Aprobar Transferencia"
                    onPress={() => setConfirmApprove(true)}
                    variant="primary"
                  />
                  <PrimaryButton
                    label="❌ Rechazar Transferencia"
                    onPress={() => setShowRejectModal(true)}
                    variant="danger"
                  />
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Modal: Rechazar */}
      <Modal visible={showRejectModal} animationType="slide" presentationStyle="formSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9", padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 20 }}>
            Rechazar Transferencia
          </Text>
          <FormField
            label="Motivo del Rechazo (opcional)"
            value={motivoRechazo}
            onChangeText={setMotivoRechazo}
            placeholder="Describe el motivo del rechazo..."
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <PrimaryButton label="Cancelar" onPress={() => setShowRejectModal(false)} variant="secondary" />
            <PrimaryButton
              label="Rechazar"
              loading={rechazarMutation.isPending}
              variant="danger"
              onPress={() => {
                rechazarMutation.mutate({
                  id: selectedTransferencia.id,
                  supervisorId: user?.id ?? 0,
                  motivo: motivoRechazo || undefined,
                });
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Confirm Approve */}
      <ConfirmModal
        visible={confirmApprove}
        title="Aprobar Transferencia"
        message={selectedTransferencia
          ? `¿Confirmas la aprobación de la transferencia de ${formatCurrency(selectedTransferencia.monto)} de la cuenta ${selectedTransferencia.cuentaOrigen} a ${selectedTransferencia.cuentaDestino}? Esta acción ejecutará el movimiento de fondos.`
          : ""
        }
        confirmLabel="Aprobar y Ejecutar"
        loading={aprobarMutation.isPending}
        onConfirm={() => {
          if (selectedTransferencia) {
            aprobarMutation.mutate({
              id: selectedTransferencia.id,
              supervisorId: user?.id ?? 0,
            });
          }
        }}
        onCancel={() => setConfirmApprove(false)}
      />
    </ScreenContainer>
  );
}
