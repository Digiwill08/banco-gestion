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
  FormField,
  ListItem,
  LoadingOverlay,
  PageHeader,
  PrimaryButton,
  SectionHeader,
  StatusBadge,
  formatDate,
} from "@/components/bank-ui";
import { useBankAuth } from "@/lib/bank-auth-context";
import { trpc } from "@/lib/trpc";

type TabType = "persona" | "empresa";

export default function ClientesScreen() {
  const { user } = useBankAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<TabType>("persona");
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<TabType>("persona");
  const [searchText, setSearchText] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Formulario persona
  const [nombre, setNombre] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("password123");

  // Formulario empresa
  const [razonSocial, setRazonSocial] = useState("");
  const [nit, setNit] = useState("");
  const [correoEmp, setCorreoEmp] = useState("");
  const [telefonoEmp, setTelefonoEmp] = useState("");
  const [direccionEmp, setDireccionEmp] = useState("");
  const [repLegal, setRepLegal] = useState("");

  const personasQuery = trpc.clientesPersona.list.useQuery();
  const empresasQuery = trpc.clientesEmpresa.list.useQuery();

  const createPersonaMutation = trpc.clientesPersona.create.useMutation({
    onSuccess: () => {
      utils.clientesPersona.list.invalidate();
      setShowCreate(false);
      resetForm();
      Alert.alert("Éxito", "Cliente persona natural registrado exitosamente");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const createEmpresaMutation = trpc.clientesEmpresa.create.useMutation({
    onSuccess: () => {
      utils.clientesEmpresa.list.invalidate();
      setShowCreate(false);
      resetForm();
      Alert.alert("Éxito", "Cliente empresa registrado exitosamente");
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  const createUserMutation = trpc.bankUsers.create.useMutation();

  const resetForm = () => {
    setNombre(""); setIdentificacion(""); setCorreo(""); setTelefono("");
    setFechaNac(""); setDireccion(""); setPassword("password123");
    setRazonSocial(""); setNit(""); setCorreoEmp(""); setTelefonoEmp("");
    setDireccionEmp(""); setRepLegal("");
  };

  const handleCreatePersona = async () => {
    if (!nombre.trim() || !identificacion.trim() || !correo.trim() || !telefono.trim() || !fechaNac.trim() || !direccion.trim()) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }
    try {
      const userResult = await createUserMutation.mutateAsync({
        nombreCompleto: nombre.trim(),
        idIdentificacion: identificacion.trim(),
        correoElectronico: correo.trim(),
        telefono: telefono.trim(),
        fechaNacimiento: fechaNac.trim(),
        direccion: direccion.trim(),
        rolSistema: "cliente_persona",
        password: password || "password123",
      });
      await createPersonaMutation.mutateAsync({
        bankUserId: userResult.id,
        nombreCompleto: nombre.trim(),
        numeroIdentificacion: identificacion.trim(),
        correoElectronico: correo.trim(),
        telefono: telefono.trim(),
        fechaNacimiento: fechaNac.trim(),
        direccion: direccion.trim(),
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleCreateEmpresa = async () => {
    if (!razonSocial.trim() || !nit.trim() || !correoEmp.trim() || !telefonoEmp.trim() || !direccionEmp.trim() || !repLegal.trim()) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }
    try {
      const userResult = await createUserMutation.mutateAsync({
        nombreCompleto: razonSocial.trim(),
        idIdentificacion: nit.trim(),
        correoElectronico: correoEmp.trim(),
        telefono: telefonoEmp.trim(),
        direccion: direccionEmp.trim(),
        rolSistema: "cliente_empresa",
        password: "password123",
      });
      await createEmpresaMutation.mutateAsync({
        bankUserId: userResult.id,
        razonSocial: razonSocial.trim(),
        nit: nit.trim(),
        correoElectronico: correoEmp.trim(),
        telefono: telefonoEmp.trim(),
        direccion: direccionEmp.trim(),
        representanteLegalId: repLegal.trim(),
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const personas = personasQuery.data ?? [];
  const empresas = empresasQuery.data ?? [];

  const filteredPersonas = personas.filter(
    (p) =>
      p.nombreCompleto.toLowerCase().includes(searchText.toLowerCase()) ||
      p.numeroIdentificacion.toLowerCase().includes(searchText.toLowerCase()) ||
      p.correoElectronico.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredEmpresas = empresas.filter(
    (e) =>
      e.razonSocial.toLowerCase().includes(searchText.toLowerCase()) ||
      e.nit.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <PageHeader
        title="Clientes"
        subtitle="Gestión de clientes"
        action={{ icon: "➕", onPress: () => { setCreateType(activeTab); setShowCreate(true); } }}
      />

      {/* Tabs */}
      <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#D1DCE8" }}>
        {(["persona", "empresa"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? "#1A3A5C" : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: activeTab === tab ? "#1A3A5C" : "#5C7A99" }}>
              {tab === "persona" ? `👤 Personas (${personas.length})` : `🏢 Empresas (${empresas.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Búsqueda */}
      <View style={{ padding: 12, backgroundColor: "#F4F6F9" }}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={activeTab === "persona" ? "Buscar por nombre o identificación..." : "Buscar por razón social o NIT..."}
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

      {activeTab === "persona" ? (
        personasQuery.isLoading ? (
          <LoadingOverlay />
        ) : !filteredPersonas.length ? (
          <EmptyState
            icon="👤"
            title="Sin clientes persona"
            subtitle={searchText ? "No se encontraron resultados" : "No hay clientes persona natural registrados"}
            action={!searchText ? { label: "Registrar Cliente", onPress: () => { setCreateType("persona"); setShowCreate(true); } } : undefined}
          />
        ) : (
          <FlatList
            data={filteredPersonas}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setSelectedCliente({ ...item, tipo: "persona" }); setShowDetail(true); }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#D1DCE8",
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF4FB", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D1B2A" }}>{item.nombreCompleto}</Text>
                    <Text style={{ fontSize: 13, color: "#5C7A99", marginTop: 2 }}>{item.numeroIdentificacion}</Text>
                    <Text style={{ fontSize: 12, color: "#9BA8B5", marginTop: 1 }}>{item.correoElectronico}</Text>
                  </View>
                  <Text style={{ color: "#5C7A99", fontSize: 18 }}>›</Text>
                </View>
              </Pressable>
            )}
          />
        )
      ) : (
        empresasQuery.isLoading ? (
          <LoadingOverlay />
        ) : !filteredEmpresas.length ? (
          <EmptyState
            icon="🏢"
            title="Sin clientes empresa"
            subtitle={searchText ? "No se encontraron resultados" : "No hay clientes empresa registrados"}
            action={!searchText ? { label: "Registrar Empresa", onPress: () => { setCreateType("empresa"); setShowCreate(true); } } : undefined}
          />
        ) : (
          <FlatList
            data={filteredEmpresas}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setSelectedCliente({ ...item, tipo: "empresa" }); setShowDetail(true); }}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#E2EBF4" : "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#D1DCE8",
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF4FB", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                    <Text style={{ fontSize: 20 }}>🏢</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0D1B2A" }}>{item.razonSocial}</Text>
                    <Text style={{ fontSize: 13, color: "#5C7A99", marginTop: 2 }}>NIT: {item.nit}</Text>
                    <Text style={{ fontSize: 12, color: "#9BA8B5", marginTop: 1 }}>{item.correoElectronico}</Text>
                  </View>
                  <Text style={{ color: "#5C7A99", fontSize: 18 }}>›</Text>
                </View>
              </Pressable>
            )}
          />
        )
      )}

      {/* Modal: Detalle cliente */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedCliente && (
          <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
            <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
                  {selectedCliente.tipo === "persona" ? "Cliente Persona" : "Cliente Empresa"}
                </Text>
                <Pressable onPress={() => setShowDetail(false)}>
                  <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#D1DCE8" }}>
                {selectedCliente.tipo === "persona" ? (
                  <>
                    {[
                      { label: "Nombre Completo", value: selectedCliente.nombreCompleto },
                      { label: "Identificación", value: selectedCliente.numeroIdentificacion },
                      { label: "Correo", value: selectedCliente.correoElectronico },
                      { label: "Teléfono", value: selectedCliente.telefono },
                      { label: "Fecha Nacimiento", value: formatDate(selectedCliente.fechaNacimiento) },
                      { label: "Dirección", value: selectedCliente.direccion },
                      { label: "Registrado", value: formatDate(selectedCliente.createdAt) },
                    ].map((row) => (
                      <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                        <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                        <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value ?? "—"}</Text>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { label: "Razón Social", value: selectedCliente.razonSocial },
                      { label: "NIT", value: selectedCliente.nit },
                      { label: "Correo", value: selectedCliente.correoElectronico },
                      { label: "Teléfono", value: selectedCliente.telefono },
                      { label: "Dirección", value: selectedCliente.direccion },
                      { label: "Rep. Legal ID", value: selectedCliente.representanteLegalId },
                      { label: "Registrado", value: formatDate(selectedCliente.createdAt) },
                    ].map((row) => (
                      <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                        <Text style={{ color: "#5C7A99", fontSize: 13 }}>{row.label}</Text>
                        <Text style={{ color: "#0D1B2A", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }}>{row.value ?? "—"}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Modal: Crear cliente */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: "#F4F6F9" }}>
          <View style={{ backgroundColor: "#1A3A5C", padding: 20, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
                {createType === "persona" ? "Registrar Cliente Persona" : "Registrar Cliente Empresa"}
              </Text>
              <Pressable onPress={() => { setShowCreate(false); resetForm(); }}>
                <Text style={{ color: "#A8C4E0", fontSize: 16 }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {createType === "persona" ? (
              <>
                <FormField label="Nombre Completo" value={nombre} onChangeText={setNombre} placeholder="Juan Pérez Torres" required />
                <FormField label="N° Identificación" value={identificacion} onChangeText={setIdentificacion} placeholder="CC12345678" autoCapitalize="characters" required />
                <FormField label="Correo Electrónico" value={correo} onChangeText={setCorreo} placeholder="juan@email.com" keyboardType="email-address" autoCapitalize="none" required />
                <FormField label="Teléfono" value={telefono} onChangeText={setTelefono} placeholder="3001234567" keyboardType="phone-pad" required />
                <FormField label="Fecha de Nacimiento" value={fechaNac} onChangeText={setFechaNac} placeholder="YYYY-MM-DD" required />
                <FormField label="Dirección" value={direccion} onChangeText={setDireccion} placeholder="Calle 50 #30-15, Medellín" required />
                <FormField label="Contraseña Inicial" value={password} onChangeText={setPassword} placeholder="password123" required />
                <PrimaryButton
                  label="Registrar Cliente"
                  onPress={handleCreatePersona}
                  loading={createPersonaMutation.isPending || createUserMutation.isPending}
                />
              </>
            ) : (
              <>
                <FormField label="Razón Social" value={razonSocial} onChangeText={setRazonSocial} placeholder="TechCorp S.A.S." required />
                <FormField label="NIT" value={nit} onChangeText={setNit} placeholder="NIT900123456" autoCapitalize="characters" required />
                <FormField label="Correo Electrónico" value={correoEmp} onChangeText={setCorreoEmp} placeholder="admin@empresa.com" keyboardType="email-address" autoCapitalize="none" required />
                <FormField label="Teléfono" value={telefonoEmp} onChangeText={setTelefonoEmp} placeholder="6012345678" keyboardType="phone-pad" required />
                <FormField label="Dirección" value={direccionEmp} onChangeText={setDireccionEmp} placeholder="Zona Industrial #45-67" required />
                <FormField label="ID Representante Legal" value={repLegal} onChangeText={setRepLegal} placeholder="CC12345678" autoCapitalize="characters" required />
                <PrimaryButton
                  label="Registrar Empresa"
                  onPress={handleCreateEmpresa}
                  loading={createEmpresaMutation.isPending || createUserMutation.isPending}
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
