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
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  formatCurrency,
  formatDate,
} from "@/components/bank-ui";
import { useBankAuth, canApproveLoans } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { TIPO_PRESTAMO_LABELS, TipoPrestamo } from "@/shared/types";

const TIPOS_PRESTAMO: { value: TipoPrestamo; label: string; icon: string }[] = [
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "hipotecario", label: "Hipotecario", icon: "🏠" },
  { value: "vehiculo", label: "Vehículo", icon: "🚗" },
  { value: "empresarial", label: "Empresarial", icon: "🏢" },
  { value: "consumo", label: "Consumo", icon: "🛒" },
];

export default function PrestamosScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const isAnalista = canApproveLoans(user?.rolSistema ?? "cliente_persona");
  const canCreate = ["cliente_persona", "cliente_empresa", "empleado_comercial", "analista_interno"].includes(user?.rolSistema ?? "");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDesembolso, setShowDesembolso] = useState(false);

  // Formulario nueva solicitud
  const [tipoPrestamo, setTipoPrestamo] = useState<TipoPrestamo>("personal");
  const [clienteId, setClienteId] = useState("");
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");
  const [cuentaDesembolso, setCuentaDesembolso] = useState("");

  // Formulario aprobación
  const [montoAprobado, setMontoAprobado] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [cuentaDesembolsoFinal, setCuentaDesembolsoFinal] = useState("");

  // Queries
  const prestamosQuery = isAnalista
    ? trpc.prestamos.listAll.useQuery()
    : trpc.prestamos.listByCliente.useQuery(
        { idClienteSolicitante: user?.idIdentificacion ?? "" },
        { enabled: !!user }
      );

  const createMutation = trpc.prestamos.create.useMutation({
    onSuccess: () => {
      utils.prestamos.listAll.invalidate();
      utils.prestamos.listByCliente.invalidate();
      utils.prestamos.listPendientes.invalidate();
      setShowCreate(false);
      setClienteId("");
      setMonto("");
      setPlazo("");
      Alert.alert("Éxito", "Solicitud de préstamo enviada. Será revisada por un analista.");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const aprobarMutation = trpc.prestamos.aprobar.useMutation({
    onSuccess: () => {
      utils.prestamos.listAll.invalidate();
      utils.prestamos.listPendientes.invalidate();
      setShowApprove(false);
      setShowDetail(false);
      Alert.alert("Éxito", "Préstamo aprobado exitosamente");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const rechazarMutation = trpc.prestamos.rechazar.useMutation({
    onSuccess: () => {
      utils.prestamos.listAll.invalidate();
      utils.prestamos.listPendientes.invalidate();
      setShowReject(false);
      setShowDetail(false);
      Alert.alert("Éxito", "Préstamo rechazado");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const desembolsarMutation = trpc.prestamos.desembolsar.useMutation({
    onSuccess: () => {
      utils.prestamos.listAll.invalidate();
      utils.prestamos.listPendientes.invalidate();
      setShowDesembolso(false);
      setShowDetail(false);
      Alert.alert("Éxito", "Préstamo desembolsado exitosamente");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const handleCreate = () => {
    const montoNum = parseFloat(monto.replace(/[^0-9.]/g, ""));
    const plazoNum = parseInt(plazo);
    if (!clienteId.trim() && !["cliente_persona", "cliente_empresa"].includes(user?.rolSistema ?? "")) {
      Alert.alert("Error", "El ID del cliente es requerido");
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser mayor a 0");
      return;
    }
    if (isNaN(plazoNum) || plazoNum <= 0) {
      Alert.alert("Error", "El plazo debe ser mayor a 0 meses");
      return;
    }
    createMutation.mutate({
      tipoPrestamo,
      idClienteSolicitante: clienteId.trim() || (user?.idIdentificacion ?? ""),
      montoSolicitado: montoNum,
      plazoMeses: plazoNum,
      cuentaDestinoDesembolso: cuentaDesembolso.trim() || undefined,
      creadoPorId: user?.id ?? 0,
    });
  };

  const prestamos = prestamosQuery.data ?? [];

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Préstamos"
        subtitle={isAnalista ? `${prestamos.length} préstamos registrados` : "Mis solicitudes"}
        action={canCreate ? { icon: "➕", onPress: () => setShowCreate(true) } : undefined}
      />

      {prestamosQuery.isLoading ? (
        <LoadingOverlay />
      ) : !prestamos.length ? (
        <EmptyState
          icon="💰"
          title="Sin préstamos"
          subtitle={isAnalista ? "No hay préstamos registrados" : "No tienes solicitudes de préstamo"}
          action={canCreate ? { label: "Solicitar Préstamo", onPress: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <FlatList
          data={prestamos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setSelectedPrestamo(item); setShowDetail(true); }}
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
                    {TIPO_PRESTAMO_LABELS[item.tipoPrestamo as TipoPrestamo] ?? item.tipoPrestamo}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#0D1B2A", marginTop: 2 }}>
                    {formatCurrency(item.montoSolicitado)}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 2 }}>
                    Cliente: {item.idClienteSolicitante} · {item.plazoMeses} meses
                  </Text>
                </View>
                <StatusBadge type="prestamo" value={item.estadoPrestamo} />
              </View>
              {item.estadoPrestamo === "aprobado" && item.montoAprobado && (
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                  <Text style={{ fontSize: 13, color: "#16A34A", fontWeight: "600" }}>
                    Aprobado: {formatCurrency(item.montoAprobado)} · Tasa: {item.tasaInteres}%
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 11, color: "#9BA8B5", marginTop: 8 }}>
                Solicitado: {formatDate(item.createdAt)}
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* Modal: Crear solicitud */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
          <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Solicitar Préstamo</Text>
              <Pressable onPress={() => setShowCreate(false)}>
                <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {!["cliente_persona", "cliente_empresa"].includes(user?.rolSistema ?? "") && (
              <FormField
                label="ID del Cliente"
                value={clienteId}
                onChangeText={setClienteId}
                placeholder="Ej: CC12345678"
                autoCapitalize="characters"
                required
              />
            )}

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 8 }}>
              Tipo de Préstamo <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TIPOS_PRESTAMO.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setTipoPrestamo(t.value)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: tipoPrestamo === t.value ? "#1A3A5C" : "#FFFFFF",
                    borderWidth: 1.5,
                    borderColor: tipoPrestamo === t.value ? "#1A3A5C" : "#D1DCE8",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text>{t.icon}</Text>
                  <Text style={{ color: tipoPrestamo === t.value ? "#FFFFFF" : "#5C7A99", fontWeight: "600", fontSize: 13 }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <FormField
              label="Monto Solicitado (COP)"
              value={monto}
              onChangeText={setMonto}
              placeholder="Ej: 5000000"
              keyboardType="numeric"
              required
            />
            <FormField
              label="Plazo (meses)"
              value={plazo}
              onChangeText={setPlazo}
              placeholder="Ej: 24"
              keyboardType="numeric"
              required
            />
            <FormField
              label="Cuenta Destino Desembolso (opcional)"
              value={cuentaDesembolso}
              onChangeText={setCuentaDesembolso}
              placeholder="Número de cuenta"
              keyboardType="numeric"
            />

            <PrimaryButton
              label="Enviar Solicitud"
              onPress={handleCreate}
              loading={createMutation.isPending}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Detalle préstamo */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedPrestamo && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Detalle Préstamo #{selectedPrestamo.id}</Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#0D1B2A" }}>
                    {TIPO_PRESTAMO_LABELS[selectedPrestamo.tipoPrestamo as TipoPrestamo]}
                  </Text>
                  <StatusBadge type="prestamo" value={selectedPrestamo.estadoPrestamo} />
                </View>
                {[
                  { label: "Cliente", value: selectedPrestamo.idClienteSolicitante },
                  { label: "Monto Solicitado", value: formatCurrency(selectedPrestamo.montoSolicitado) },
                  { label: "Plazo", value: `${selectedPrestamo.plazoMeses} meses` },
                  { label: "Fecha Solicitud", value: formatDate(selectedPrestamo.createdAt) },
                  ...(selectedPrestamo.montoAprobado ? [
                    { label: "Monto Aprobado", value: formatCurrency(selectedPrestamo.montoAprobado) },
                    { label: "Tasa de Interés", value: `${selectedPrestamo.tasaInteres}% EA` },
                    { label: "Fecha Aprobación", value: formatDate(selectedPrestamo.fechaAprobacion) },
                  ] : []),
                  ...(selectedPrestamo.motivoRechazo ? [
                    { label: "Motivo Rechazo", value: selectedPrestamo.motivoRechazo },
                  ] : []),
                  ...(selectedPrestamo.fechaDesembolso ? [
                    { label: "Fecha Desembolso", value: formatDate(selectedPrestamo.fechaDesembolso) },
                    { label: "Cuenta Desembolso", value: selectedPrestamo.cuentaDestinoDesembolso ?? "—" },
                  ] : []),
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                    <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Acciones analista */}
              {isAnalista && selectedPrestamo.estadoPrestamo === "en_estudio" && (
                <View style={{ gap: 10, marginBottom: 16 }}>
                  <PrimaryButton label="✅ Aprobar Préstamo" onPress={() => setShowApprove(true)} variant="primary" />
                  <PrimaryButton label="❌ Rechazar Préstamo" onPress={() => setShowReject(true)} variant="danger" />
                </View>
              )}
              {isAnalista && selectedPrestamo.estadoPrestamo === "aprobado" && (
                <PrimaryButton label="💸 Desembolsar Préstamo" onPress={() => setShowDesembolso(true)} variant="primary" />
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Modal: Aprobar */}
      <Modal visible={showApprove} animationType="slide" presentationStyle="formSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9", padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 20 }}>Aprobar Préstamo</Text>
          <FormField
            label="Monto Aprobado (COP)"
            value={montoAprobado}
            onChangeText={setMontoAprobado}
            placeholder={selectedPrestamo ? String(selectedPrestamo.montoSolicitado) : ""}
            keyboardType="numeric"
            required
          />
          <FormField
            label="Tasa de Interés (% EA)"
            value={tasaInteres}
            onChangeText={setTasaInteres}
            placeholder="Ej: 12.5"
            keyboardType="decimal-pad"
            required
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <PrimaryButton label="Cancelar" onPress={() => setShowApprove(false)} variant="secondary" />
            <PrimaryButton
              label="Aprobar"
              loading={aprobarMutation.isPending}
              onPress={() => {
                const m = parseFloat(montoAprobado);
                const t = parseFloat(tasaInteres);
                if (isNaN(m) || m <= 0) { Alert.alert("Error", "Monto inválido"); return; }
                if (isNaN(t) || t <= 0) { Alert.alert("Error", "Tasa inválida"); return; }
                aprobarMutation.mutate({ id: selectedPrestamo.id, montoAprobado: m, tasaInteres: t, analistaId: user?.id ?? 0 });
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Rechazar */}
      <Modal visible={showReject} animationType="slide" presentationStyle="formSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9", padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 20 }}>Rechazar Préstamo</Text>
          <FormField
            label="Motivo del Rechazo"
            value={motivoRechazo}
            onChangeText={setMotivoRechazo}
            placeholder="Describe el motivo del rechazo..."
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
            required
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <PrimaryButton label="Cancelar" onPress={() => setShowReject(false)} variant="secondary" />
            <PrimaryButton
              label="Rechazar"
              loading={rechazarMutation.isPending}
              variant="danger"
              onPress={() => {
                if (!motivoRechazo.trim() || motivoRechazo.trim().length < 5) {
                  Alert.alert("Error", "El motivo debe tener al menos 5 caracteres");
                  return;
                }
                rechazarMutation.mutate({ id: selectedPrestamo.id, motivo: motivoRechazo, analistaId: user?.id ?? 0 });
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Desembolso */}
      <Modal visible={showDesembolso} animationType="slide" presentationStyle="formSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9", padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 20 }}>Desembolsar Préstamo</Text>
          <FormField
            label="Cuenta Destino"
            value={cuentaDesembolsoFinal}
            onChangeText={setCuentaDesembolsoFinal}
            placeholder="Número de cuenta bancaria"
            keyboardType="numeric"
            required
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <PrimaryButton label="Cancelar" onPress={() => setShowDesembolso(false)} variant="secondary" />
            <PrimaryButton
              label="Desembolsar"
              loading={desembolsarMutation.isPending}
              onPress={() => {
                if (!cuentaDesembolsoFinal.trim()) {
                  Alert.alert("Error", "La cuenta destino es requerida");
                  return;
                }
                desembolsarMutation.mutate({ id: selectedPrestamo.id, cuentaDestino: cuentaDesembolsoFinal, analistaId: user?.id ?? 0 });
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
