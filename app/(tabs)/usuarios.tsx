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
  EmptyState,
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  StatusBadge,
  formatDate,
} from "@/components/bank-ui";
import { useBankAuth } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";
import { ROL_LABELS, RolSistema } from "@/shared/types";

export default function UsuariosScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const usersQuery = trpc.bankUsers.list.useQuery();
  const updateEstadoMutation = trpc.bankUsers.updateEstado.useMutation({
    onSuccess: () => {
      utils.bankUsers.list.invalidate();
      setShowDetail(false);
      Alert.alert("Éxito", "Estado del usuario actualizado");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const users = usersQuery.data ?? [];
  const filteredUsers = users.filter(
    (u) =>
      u.nombreCompleto.toLowerCase().includes(searchText.toLowerCase()) ||
      u.idIdentificacion.toLowerCase().includes(searchText.toLowerCase()) ||
      u.correoElectronico.toLowerCase().includes(searchText.toLowerCase()) ||
      u.rolSistema.toLowerCase().includes(searchText.toLowerCase())
  );

  const ROL_ICONS: Record<RolSistema, string> = {
    cliente_persona: "👤",
    cliente_empresa: "🏢",
    empleado_ventanilla: "🏦",
    empleado_comercial: "💼",
    empleado_empresa: "⚙️",
    supervisor_empresa: "🔍",
    analista_interno: "📊",
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Usuarios del Sistema"
        subtitle={`${users.length} usuarios registrados`}
      />

      {/* Búsqueda */}
      <View style={{ padding: 12, backgroundColor: "#F4F6F9" }}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por nombre, ID o rol..."
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

      {usersQuery.isLoading ? (
        <LoadingOverlay />
      ) : !filteredUsers.length ? (
        <EmptyState
          icon="👥"
          title="Sin usuarios"
          subtitle={searchText ? "No se encontraron resultados" : "No hay usuarios registrados"}
        />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setSelectedUser(item); setShowDetail(true); }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#D1DCE8",
                flexDirection: "row",
                alignItems: "center",
              })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF4FB", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 20 }}>{ROL_ICONS[item.rolSistema as RolSistema] ?? "👤"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#0D1B2A" }} numberOfLines={1}>
                  {item.nombreCompleto}
                </Text>
                <Text style={{ fontSize: 12, color: "#5C7A99", marginTop: 1 }}>
                  {item.idIdentificacion} · {ROL_LABELS[item.rolSistema as RolSistema] ?? item.rolSistema}
                </Text>
              </View>
              <StatusBadge type="usuario" value={item.estadoUsuario} />
            </Pressable>
          )}
        />
      )}

      {/* Modal: Detalle usuario */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedUser && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>Detalle Usuario</Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Avatar */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#1A3A5C", justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 28 }}>{ROL_ICONS[selectedUser.rolSistema as RolSistema] ?? "👤"}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0D1B2A" }}>{selectedUser.nombreCompleto}</Text>
                <StatusBadge type="usuario" value={selectedUser.estadoUsuario} />
              </View>

              {/* Info */}
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
                {[
                  { label: "ID", value: String(selectedUser.id) },
                  { label: "Identificación", value: selectedUser.idIdentificacion },
                  { label: "Correo", value: selectedUser.correoElectronico },
                  { label: "Teléfono", value: selectedUser.telefono },
                  { label: "Dirección", value: selectedUser.direccion },
                  { label: "Rol", value: ROL_LABELS[selectedUser.rolSistema as RolSistema] ?? selectedUser.rolSistema },
                  { label: "Estado", value: selectedUser.estadoUsuario },
                  ...(selectedUser.fechaNacimiento ? [{ label: "Nacimiento", value: formatDate(selectedUser.fechaNacimiento) }] : []),
                  ...(selectedUser.empresaId ? [{ label: "ID Empresa", value: String(selectedUser.empresaId) }] : []),
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                    <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Acciones de estado (solo si no es el mismo usuario) */}
              {selectedUser.id !== user?.id && (
                <View style={{ gap: 10 }}>
                  {selectedUser.estadoUsuario === "activo" && (
                    <PrimaryButton
                      label="🔒 Bloquear Usuario"
                      onPress={() => {
                        Alert.alert("Bloquear Usuario", `¿Deseas bloquear a ${selectedUser.nombreCompleto}?`, [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Bloquear", style: "destructive", onPress: () => updateEstadoMutation.mutate({ id: selectedUser.id, estadoUsuario: "bloqueado" }) },
                        ]);
                      }}
                      variant="danger"
                      loading={updateEstadoMutation.isPending}
                    />
                  )}
                  {selectedUser.estadoUsuario === "bloqueado" && (
                    <PrimaryButton
                      label="🔓 Activar Usuario"
                      onPress={() => {
                        Alert.alert("Activar Usuario", `¿Deseas activar a ${selectedUser.nombreCompleto}?`, [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Activar", onPress: () => updateEstadoMutation.mutate({ id: selectedUser.id, estadoUsuario: "activo" }) },
                        ]);
                      }}
                      variant="secondary"
                      loading={updateEstadoMutation.isPending}
                    />
                  )}
                  {selectedUser.estadoUsuario !== "inactivo" && (
                    <PrimaryButton
                      label="⛔ Desactivar Usuario"
                      onPress={() => {
                        Alert.alert("Desactivar Usuario", `¿Deseas desactivar a ${selectedUser.nombreCompleto}?`, [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Desactivar", style: "destructive", onPress: () => updateEstadoMutation.mutate({ id: selectedUser.id, estadoUsuario: "inactivo" }) },
                        ]);
                      }}
                      variant="danger"
                      loading={updateEstadoMutation.isPending}
                    />
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}
