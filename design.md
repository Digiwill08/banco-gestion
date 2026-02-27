# BancoGestión — Plan de Diseño de Interfaz Móvil

## Concepto Visual

Aplicación bancaria corporativa con estética profesional y seria. Paleta de colores azul marino y blanco, con acentos en verde para estados positivos y rojo para alertas. Tipografía limpia y legible. Diseño orientado a la confianza y seguridad.

## Paleta de Colores

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| primary | #1A3A5C | #2E6DA4 | Acciones principales, botones, encabezados |
| background | #F4F6F9 | #0F1923 | Fondo general |
| surface | #FFFFFF | #1A2535 | Tarjetas, modales |
| foreground | #0D1B2A | #E8EDF2 | Texto principal |
| muted | #5C7A99 | #7A9BBF | Texto secundario |
| border | #D1DCE8 | #2A3F55 | Bordes |
| success | #16A34A | #22C55E | Estados activos, aprobados |
| warning | #D97706 | #FBBF24 | En espera, pendiente |
| error | #DC2626 | #F87171 | Rechazado, bloqueado, error |

## Lista de Pantallas

### Autenticación
- **LoginScreen** — Formulario de inicio de sesión (usuario + contraseña)

### Pantallas Comunes (Post-Login)
- **DashboardScreen** — Panel principal adaptado al rol del usuario
- **ProfileScreen** — Perfil del usuario autenticado

### Gestión de Clientes (Empleado Ventanilla, Comercial, Analista)
- **ClientListScreen** — Lista de clientes (personas naturales y empresas)
- **ClientDetailScreen** — Detalle completo de un cliente
- **ClientCreateScreen** — Formulario de registro de nuevo cliente

### Gestión de Cuentas
- **AccountListScreen** — Lista de cuentas bancarias del cliente/empresa
- **AccountDetailScreen** — Detalle de cuenta (saldo, estado, movimientos)
- **AccountCreateScreen** — Apertura de nueva cuenta bancaria

### Gestión de Préstamos
- **LoanListScreen** — Lista de préstamos del cliente o todos (según rol)
- **LoanDetailScreen** — Detalle del préstamo con estado y pagos
- **LoanCreateScreen** — Solicitud de nuevo préstamo
- **LoanApprovalScreen** — Pantalla de aprobación/rechazo (Analista Interno)

### Gestión de Transferencias
- **TransferListScreen** — Historial de transferencias
- **TransferCreateScreen** — Crear nueva transferencia
- **TransferApprovalScreen** — Aprobar/rechazar transferencias (Supervisor Empresa)

### Bitácora
- **AuditLogScreen** — Bitácora completa de operaciones (Analista Interno)

### Administración (Analista / Supervisor)
- **UserListScreen** — Lista de usuarios del sistema
- **UserCreateScreen** — Registro de nuevo usuario

## Flujos de Usuario Clave

### Flujo 1: Login y Dashboard
1. Usuario abre la app → LoginScreen
2. Ingresa credenciales → validación de rol
3. Redirige al DashboardScreen personalizado según rol

### Flujo 2: Solicitud de Préstamo (Cliente)
1. Dashboard → "Solicitar Préstamo" → LoanCreateScreen
2. Completa formulario → envía solicitud (estado: "En estudio")
3. LoanListScreen muestra el préstamo en estado pendiente

### Flujo 3: Aprobación de Préstamo (Analista)
1. Dashboard muestra préstamos pendientes
2. Analista → LoanApprovalScreen → aprueba o rechaza
3. Si aprueba → puede marcar como "Desembolsado" con cuenta destino

### Flujo 4: Transferencia Empresarial
1. Empleado Empresa → TransferCreateScreen → crea transferencia
2. Si monto > umbral → estado "En espera de aprobación"
3. Supervisor → TransferApprovalScreen → aprueba o rechaza
4. Si aprueba → saldos actualizados, bitácora registrada

## Layout por Rol

### Cliente Persona Natural
- Tabs: Inicio | Cuentas | Préstamos | Transferencias

### Cliente Empresa / Empleado de Empresa
- Tabs: Inicio | Cuentas | Transferencias | Perfil

### Empleado de Ventanilla
- Tabs: Inicio | Clientes | Cuentas | Perfil

### Empleado Comercial
- Tabs: Inicio | Clientes | Préstamos | Perfil

### Supervisor de Empresa
- Tabs: Inicio | Cuentas | Aprobaciones | Perfil

### Analista Interno
- Tabs: Inicio | Clientes | Préstamos | Bitácora

## Componentes UI Reutilizables

- **StatusBadge** — Muestra estado con color (Activo=verde, Bloqueado=rojo, Pendiente=amarillo)
- **InfoCard** — Tarjeta con título, valor y subtítulo
- **SectionHeader** — Encabezado de sección con título y acción opcional
- **EmptyState** — Pantalla vacía con icono y mensaje
- **ConfirmModal** — Modal de confirmación para acciones críticas
- **FormField** — Campo de formulario con label, input y error
- **RoleGuard** — Componente que oculta/muestra contenido según rol
