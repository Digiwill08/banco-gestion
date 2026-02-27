import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { PageHeader, StatusBadge, formatDate } from "@/components/bank-ui";
import { useBankAuth } from "@/lib/bank-auth-context";
import { ROL_LABELS } from "@/shared/types";

export default function PerfilScreen() {
  const { user, logout } = useBankAuth();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Deseas cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader title="Mi Perfil" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Avatar y nombre */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#1A3A5C",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 36 }}>
              {user.rolSistema === "cliente_persona" ? "👤"
                : user.rolSistema === "cliente_empresa" ? "🏢"
                : user.rolSistema === "empleado_ventanilla" ? "🏦"
                : user.rolSistema === "empleado_comercial" ? "💼"
                : user.rolSistema === "empleado_empresa" ? "⚙️"
                : user.rolSistema === "supervisor_empresa" ? "🔍"
                : "📊"}
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0D1B2A" }}>{user.nombreCompleto}</Text>
          <View style={{ marginTop: 6 }}>
            <StatusBadge type="usuario" value={user.estadoUsuario} />
          </View>
          <Text style={{ fontSize: 14, color: "#5C7A99", marginTop: 6 }}>
            {ROL_LABELS[user.rolSistema]}
          </Text>
        </View>

        {/* Información personal */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#D1DCE8" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0D1B2A", marginBottom: 12 }}>
            Información Personal
          </Text>
          {[
            { label: "ID Identificación", value: user.idIdentificacion },
            { label: "Correo Electrónico", value: user.correoElectronico },
            { label: "Teléfono", value: user.telefono },
            { label: "Dirección", value: user.direccion },
            ...(user.fechaNacimiento ? [{ label: "Fecha de Nacimiento", value: formatDate(user.fechaNacimiento) }] : []),
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
              <Text style={{ color: "#5C7A99", fontSize: 13, flex: 1 }}>{row.label}</Text>
              <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Información del sistema */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: "#D1DCE8" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0D1B2A", marginBottom: 12 }}>
            Información del Sistema
          </Text>
          {[
            { label: "ID de Usuario", value: String(user.id) },
            { label: "Rol en el Sistema", value: ROL_LABELS[user.rolSistema] },
            { label: "Estado", value: user.estadoUsuario },
            ...(user.empresaId ? [{ label: "ID Empresa", value: String(user.empresaId) }] : []),
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
              <Text style={{ color: "#5C7A99", fontSize: 13, flex: 1 }}>{row.label}</Text>
              <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#B91C1C" : "#DC2626",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
          })}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>🚪 Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
