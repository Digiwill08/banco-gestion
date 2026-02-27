import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import {
  EstadoCuenta,
  EstadoPrestamo,
  EstadoTransferencia,
  EstadoUsuario,
  ESTADO_CUENTA_LABELS,
  ESTADO_PRESTAMO_LABELS,
  ESTADO_TRANSFERENCIA_LABELS,
  ESTADO_USUARIO_LABELS,
} from "@/shared/types";

// ─── StatusBadge ─────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: "#DCFCE7", text: "#16A34A" },
  warning: { bg: "#FEF9C3", text: "#D97706" },
  error: { bg: "#FEE2E2", text: "#DC2626" },
  info: { bg: "#DBEAFE", text: "#1D4ED8" },
  neutral: { bg: "#F1F5F9", text: "#5C7A99" },
};

function getEstadoCuentaVariant(estado: EstadoCuenta): BadgeVariant {
  if (estado === "activa") return "success";
  if (estado === "bloqueada") return "error";
  return "neutral";
}

function getEstadoPrestamoVariant(estado: EstadoPrestamo): BadgeVariant {
  if (estado === "aprobado" || estado === "desembolsado") return "success";
  if (estado === "rechazado") return "error";
  if (estado === "en_estudio") return "warning";
  return "neutral";
}

function getEstadoTransferenciaVariant(estado: EstadoTransferencia): BadgeVariant {
  if (estado === "ejecutada") return "success";
  if (estado === "rechazada" || estado === "vencida") return "error";
  if (estado === "en_espera_aprobacion") return "warning";
  return "neutral";
}

function getEstadoUsuarioVariant(estado: EstadoUsuario): BadgeVariant {
  if (estado === "activo") return "success";
  if (estado === "bloqueado") return "error";
  return "neutral";
}

interface StatusBadgeProps {
  type: "cuenta" | "prestamo" | "transferencia" | "usuario" | "custom";
  value: string;
  label?: string;
  variant?: BadgeVariant;
}

export function StatusBadge({ type, value, label, variant }: StatusBadgeProps) {
  let resolvedVariant: BadgeVariant = variant ?? "neutral";
  let resolvedLabel = label ?? value;

  if (type === "cuenta") {
    resolvedVariant = getEstadoCuentaVariant(value as EstadoCuenta);
    resolvedLabel = ESTADO_CUENTA_LABELS[value as EstadoCuenta] ?? value;
  } else if (type === "prestamo") {
    resolvedVariant = getEstadoPrestamoVariant(value as EstadoPrestamo);
    resolvedLabel = ESTADO_PRESTAMO_LABELS[value as EstadoPrestamo] ?? value;
  } else if (type === "transferencia") {
    resolvedVariant = getEstadoTransferenciaVariant(value as EstadoTransferencia);
    resolvedLabel = ESTADO_TRANSFERENCIA_LABELS[value as EstadoTransferencia] ?? value;
  } else if (type === "usuario") {
    resolvedVariant = getEstadoUsuarioVariant(value as EstadoUsuario);
    resolvedLabel = ESTADO_USUARIO_LABELS[value as EstadoUsuario] ?? value;
  }

  const colors = BADGE_COLORS[resolvedVariant];

  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>{resolvedLabel}</Text>
    </View>
  );
}

// ─── InfoCard ─────────────────────────────────────────────────────────────────

interface InfoCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}

export function InfoCard({ label, value, subtitle, accent }: InfoCardProps) {
  return (
    <View
      style={{
        backgroundColor: accent ? "#1A3A5C" : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        borderWidth: accent ? 0 : 1,
        borderColor: "#D1DCE8",
        flex: 1,
      }}
    >
      <Text style={{ fontSize: 12, color: accent ? "#A8C4E0" : "#5C7A99", fontWeight: "500", marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: accent ? "#FFFFFF" : "#0D1B2A" }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 11, color: accent ? "#A8C4E0" : "#5C7A99", marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#0D1B2A" }}>{title}</Text>
      {action && (
        <Pressable onPress={action.onPress}>
          <Text style={{ fontSize: 14, color: "#1A3A5C", fontWeight: "600" }}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon = "📋", title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>{icon}</Text>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#0D1B2A", textAlign: "center", marginBottom: 6 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: "#5C7A99", textAlign: "center", marginBottom: 16 }}>
          {subtitle}
        </Text>
      )}
      {action && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#0D2240" : "#1A3A5C",
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 12,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading,
  destructive,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0D1B2A", marginBottom: 8 }}>{title}</Text>
          <Text style={{ fontSize: 14, color: "#5C7A99", lineHeight: 20, marginBottom: 24 }}>{message}</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? "#E5E7EB" : "#F1F5F9",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#0D1B2A", fontWeight: "600" }}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: destructive
                  ? pressed ? "#B91C1C" : "#DC2626"
                  : pressed ? "#0D2240" : "#1A3A5C",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
                opacity: loading ? 0.7 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({ label, error, required, style, ...props }: FormFieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#5C7A99", marginBottom: 6 }}>
        {label}
        {required && <Text style={{ color: "#DC2626" }}> *</Text>}
      </Text>
      <TextInput
        placeholderTextColor="#9BA8B5"
        style={[
          {
            borderWidth: 1.5,
            borderColor: error ? "#DC2626" : "#D1DCE8",
            borderRadius: 10,
            padding: 14,
            fontSize: 15,
            color: "#0D1B2A",
            backgroundColor: "#F8FAFC",
          },
          style,
        ]}
        {...props}
      />
      {error && <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

// ─── LoadingOverlay ───────────────────────────────────────────────────────────

export function LoadingOverlay({ message = "Cargando..." }: { message?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F6F9" }}>
      <ActivityIndicator size="large" color="#1A3A5C" />
      <Text style={{ marginTop: 12, color: "#5C7A99", fontSize: 14 }}>{message}</Text>
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

export function PrimaryButton({ label, onPress, loading, disabled, variant = "primary", fullWidth = true }: PrimaryButtonProps) {
  const bgColors = {
    primary: { normal: "#1A3A5C", pressed: "#0D2240" },
    secondary: { normal: "#F1F5F9", pressed: "#E2E8F0" },
    danger: { normal: "#DC2626", pressed: "#B91C1C" },
  };
  const textColors = {
    primary: "#FFFFFF",
    secondary: "#1A3A5C",
    danger: "#FFFFFF",
  };
  const colors = bgColors[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.pressed : colors.normal,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        opacity: disabled || loading ? 0.6 : 1,
        alignSelf: fullWidth ? "stretch" : "auto",
      })}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <Text style={{ color: textColors[variant], fontSize: 15, fontWeight: "700" }}>{label}</Text>
      )}
    </Pressable>
  );
}

// ─── ListItem ─────────────────────────────────────────────────────────────────

interface ListItemProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  icon?: string;
}

export function ListItem({ title, subtitle, right, onPress, icon }: ListItemProps) {
  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#D1DCE8",
      }}
    >
      {icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#EEF4FB",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#0D1B2A" }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: "#5C7A99", marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={{ marginLeft: 8 }}>{right}</View>}
      {onPress && (
        <Text style={{ color: "#5C7A99", fontSize: 18, marginLeft: 4 }}>›</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: { icon: string; onPress: () => void };
}

export function PageHeader({ title, subtitle, onBack, action }: PageHeaderProps) {
  return (
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
      {onBack && (
        <Pressable onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 22 }}>‹</Text>
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 13, color: "#A8C4E0", marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {action && (
        <Pressable onPress={action.onPress} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22 }}>{action.icon}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: string | number, moneda = "COP"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr: string | Date | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
