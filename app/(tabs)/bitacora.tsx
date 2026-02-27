import { useState } from "react";
import {
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
  EmptyState,
  LoadingOverlay,
  PageHeader,
  StatusBadge,
  formatDateTime,
} from "@/components/bank-ui";
import { trpc } from "@/lib/trpc";

const TIPO_OP_ICONS: Record<string, string> = {
  SOLICITUD_PRESTAMO: "💰",
  APROBACION_PRESTAMO: "✅",
  RECHAZO_PRESTAMO: "❌",
  DESEMBOLSO_PRESTAMO: "💸",
  TRANSFERENCIA_EJECUTADA: "↔️",
  TRANSFERENCIA_EN_ESPERA: "⏳",
  TRANSFERENCIA_APROBADA: "✅",
  TRANSFERENCIA_RECHAZADA: "❌",
  TRANSFERENCIA_VENCIDA: "⏰",
};

const TIPO_OP_LABELS: Record<string, string> = {
  SOLICITUD_PRESTAMO: "Solicitud de Préstamo",
  APROBACION_PRESTAMO: "Aprobación de Préstamo",
  RECHAZO_PRESTAMO: "Rechazo de Préstamo",
  DESEMBOLSO_PRESTAMO: "Desembolso de Préstamo",
  TRANSFERENCIA_EJECUTADA: "Transferencia Ejecutada",
  TRANSFERENCIA_EN_ESPERA: "Transferencia en Espera",
  TRANSFERENCIA_APROBADA: "Transferencia Aprobada",
  TRANSFERENCIA_RECHAZADA: "Transferencia Rechazada",
  TRANSFERENCIA_VENCIDA: "Transferencia Vencida",
};

const TIPO_OP_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  SOLICITUD_PRESTAMO: "info",
  APROBACION_PRESTAMO: "success",
  RECHAZO_PRESTAMO: "error",
  DESEMBOLSO_PRESTAMO: "success",
  TRANSFERENCIA_EJECUTADA: "success",
  TRANSFERENCIA_EN_ESPERA: "warning",
  TRANSFERENCIA_APROBADA: "success",
  TRANSFERENCIA_RECHAZADA: "error",
  TRANSFERENCIA_VENCIDA: "error",
};

export default function BitacoraScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const bitacoraQuery = trpc.bitacora.listAll.useQuery();
  const entries = bitacoraQuery.data ?? [];

  const tiposUnicos = ["all", ...Array.from(new Set(entries.map((e) => e.tipoOperacion)))];

  const filteredEntries = entries.filter((e) => {
    const matchSearch =
      !searchText ||
      e.tipoOperacion.toLowerCase().includes(searchText.toLowerCase()) ||
      e.idProductoAfectado?.toLowerCase().includes(searchText.toLowerCase()) ||
      String(e.idUsuario).includes(searchText);
    const matchFilter = filterType === "all" || e.tipoOperacion === filterType;
    return matchSearch && matchFilter;
  });

  const parseDetalle = (detalle: string | null) => {
    if (!detalle) return null;
    try {
      return JSON.parse(detalle);
    } catch {
      return null;
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Bitácora de Operaciones"
        subtitle={`${entries.length} registros totales`}
      />

      {/* Búsqueda */}
      <View style={{ padding: 12, backgroundColor: "#F4F6F9" }}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por tipo, producto o usuario..."
          placeholderTextColor="#9BA8B5"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            color: "#0D1B2A",
            borderWidth: 1,
            borderColor: "#D1DCE8",
          }}
        />
      </View>

      {/* Filtros por tipo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 8 }}
      >
        {tiposUnicos.slice(0, 8).map((tipo) => (
          <Pressable
            key={tipo}
            onPress={() => setFilterType(tipo)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: filterType === tipo ? "#1A3A5C" : "#FFFFFF",
              borderWidth: 1,
              borderColor: filterType === tipo ? "#1A3A5C" : "#D1DCE8",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: filterType === tipo ? "#FFFFFF" : "#5C7A99" }}>
              {tipo === "all" ? "Todos" : (TIPO_OP_LABELS[tipo] ?? tipo).split(" ").slice(0, 2).join(" ")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {bitacoraQuery.isLoading ? (
        <LoadingOverlay />
      ) : !filteredEntries.length ? (
        <EmptyState
          icon="📋"
          title="Sin registros"
          subtitle={searchText || filterType !== "all" ? "No se encontraron registros con ese filtro" : "No hay operaciones registradas en la bitácora"}
        />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => {
            const icon = TIPO_OP_ICONS[item.tipoOperacion] ?? "📄";
            const label = TIPO_OP_LABELS[item.tipoOperacion] ?? item.tipoOperacion;
            const variant = TIPO_OP_VARIANT[item.tipoOperacion] ?? "neutral";

            return (
              <Pressable
                onPress={() => { setSelectedEntry(item); setShowDetail(true); }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#D1DCE8",
                  flexDirection: "row",
                  alignItems: "center",
                })}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#EEF4FB",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#0D1B2A", flex: 1 }} numberOfLines={1}>
                      {label}
                    </Text>
                    <StatusBadge type="custom" value={item.tipoOperacion} label={label.split(" ")[0]} variant={variant} />
                  </View>
                  <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 2 }}>
                    Producto: {item.idProductoAfectado ?? "—"} · Usuario: {item.idUsuario}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9BA8B5", marginTop: 2 }}>
                    {formatDateTime(item.fechaHoraOperacion)}
                  </Text>
                </View>
                <Text style={{ color: "#5C7A99", fontSize: 16, marginLeft: 4 }}>›</Text>
              </Pressable>
            );
          }}
        />
      )}

      {/* Modal: Detalle entrada bitácora */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedEntry && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF" }}>
                  {TIPO_OP_ICONS[selectedEntry.tipoOperacion] ?? "📄"} Detalle de Operación
                </Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
                {[
                  { label: "ID Registro", value: String(selectedEntry.id) },
                  { label: "Tipo Operación", value: TIPO_OP_LABELS[selectedEntry.tipoOperacion] ?? selectedEntry.tipoOperacion },
                  { label: "ID Usuario", value: String(selectedEntry.idUsuario) },
                  { label: "Rol Usuario", value: selectedEntry.rolUsuario },
                  { label: "Producto Afectado", value: selectedEntry.idProductoAfectado ?? "—" },
                  { label: "Fecha y Hora", value: formatDateTime(selectedEntry.fechaHoraOperacion) },
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                    <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Datos detalle JSON */}
              {selectedEntry.datosDetalle && (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#D1DCE8" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D1B2A", marginBottom: 12 }}>
                    Datos de la Operación
                  </Text>
                  {(() => {
                    const detalle = parseDetalle(selectedEntry.datosDetalle);
                    if (!detalle) return <Text style={{ color: "#5C7A99", fontSize: 13 }}>{selectedEntry.datosDetalle}</Text>;
                    return Object.entries(detalle).map(([key, value]) => (
                      <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                        <Text style={{ color: "#5C7A99", fontSize: 12, flex: 1 }}>{key}</Text>
                        <Text style={{ color: "#0D1B2A", fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right" }}>
                          {String(value)}
                        </Text>
                      </View>
                    ));
                  })()}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}
