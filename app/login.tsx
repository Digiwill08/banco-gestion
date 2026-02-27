import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useBankAuth } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";

export default function LoginScreen() {
  const { login } = useBankAuth();
  const [idIdentificacion, setIdIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.bankAuth.login.useMutation();
  const seedMutation = trpc.seed.init.useMutation();

  const handleLogin = async () => {
    if (!idIdentificacion.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu identificación y contraseña");
      return;
    }
    setLoading(true);
    try {
      const user = await loginMutation.mutateAsync({ idIdentificacion: idIdentificacion.trim(), password });
      await login(user as any);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error de acceso", err.message ?? "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seedMutation.mutateAsync();
      Alert.alert("Datos de demostración", result.message);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1A3A5C" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo y título */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 90, height: 90, borderRadius: 20, marginBottom: 16 }}
            contentFit="cover"
          />
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 }}>
            BancoGestión
          </Text>
          <Text style={{ fontSize: 14, color: "#A8C4E0", marginTop: 4 }}>
            Sistema de Gestión Bancaria
          </Text>
        </View>

        {/* Formulario */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 20 }}>
            Iniciar Sesión
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 6 }}>
              N° de Identificación
            </Text>
            <TextInput
              value={idIdentificacion}
              onChangeText={setIdIdentificacion}
              placeholder="Ej: CC12345678 o ADMIN001"
              placeholderTextColor="#9BA8B5"
              autoCapitalize="characters"
              returnKeyType="next"
              style={{
                borderWidth: 1.5,
                borderColor: "#D1DCE8",
                borderRadius: 10,
                padding: 14,
                fontSize: 15,
                color: "#0D1B2A",
                backgroundColor: "#F8FAFC",
              }}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 6 }}>
              Contraseña
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9BA8B5"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={{
                borderWidth: 1.5,
                borderColor: "#D1DCE8",
                borderRadius: 10,
                padding: 14,
                fontSize: 15,
                color: "#0D1B2A",
                backgroundColor: "#F8FAFC",
              }}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#0D2240" : "#1A3A5C",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                Ingresar
              </Text>
            )}
          </Pressable>
        </View>

        {/* Usuarios de prueba */}
        <View style={{ marginTop: 24, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16 }}>
          <Text style={{ color: "#A8C4E0", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
            Usuarios de demostración (contraseña: password123)
          </Text>
          {[
            { id: "ADMIN001", rol: "Analista Interno" },
            { id: "EMP001", rol: "Empleado Ventanilla" },
            { id: "EMP002", rol: "Empleado Comercial" },
            { id: "CC12345678", rol: "Cliente Persona" },
            { id: "NIT900123456", rol: "Cliente Empresa" },
            { id: "CC98765432", rol: "Supervisor Empresa" },
            { id: "CC11223344", rol: "Empleado Empresa" },
          ].map((u) => (
            <Pressable
              key={u.id}
              onPress={() => { setIdIdentificacion(u.id); setPassword("password123"); }}
              style={{ paddingVertical: 4 }}
            >
              <Text style={{ color: "#E0EEFA", fontSize: 12 }}>
                <Text style={{ fontWeight: "700" }}>{u.id}</Text> — {u.rol}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={handleSeed}
            style={{ marginTop: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, padding: 10, alignItems: "center" }}
          >
            <Text style={{ color: "#A8C4E0", fontSize: 12, fontWeight: "600" }}>
              Cargar datos de demostración
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
