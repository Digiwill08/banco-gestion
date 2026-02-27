# BancoGestión — TODO

## Configuración y Base
- [x] Generar logo de la aplicación bancaria
- [x] Configurar paleta de colores bancaria en theme.config.js
- [x] Configurar esquema de base de datos (usuarios, clientes, cuentas, préstamos, transferencias)
- [x] Configurar servidor con rutas API (tRPC)
- [x] Configurar autenticación con sesiones

## Autenticación
- [x] Pantalla de Login con validación de credenciales
- [x] Contexto de autenticación con rol del usuario
- [x] Protección de rutas por rol
- [x] Logout

## Gestión de Usuarios
- [x] Listar usuarios del sistema (Analista)
- [x] Crear nuevo usuario con rol asignado
- [x] Validaciones: email único, identificación única, mayor de edad

## Gestión de Clientes
- [x] Listar clientes (Personas Naturales y Empresas)
- [x] Detalle de cliente
- [x] Crear cliente Persona Natural (con validaciones)
- [x] Crear cliente Empresa (con validaciones)

## Gestión de Cuentas Bancarias
- [x] Listar cuentas del cliente autenticado
- [x] Detalle de cuenta (saldo, estado, tipo)
- [x] Abrir nueva cuenta bancaria (Empleado Ventanilla / Comercial)
- [x] Validar que cliente esté activo para abrir cuenta
- [x] Validar número de cuenta único

## Gestión de Préstamos
- [x] Listar préstamos del cliente autenticado
- [x] Detalle de préstamo
- [x] Solicitar nuevo préstamo (Cliente / Empleado Comercial)
- [x] Aprobar/Rechazar préstamo (Analista Interno)
- [x] Desembolsar préstamo (Analista Interno) — actualiza saldo cuenta destino
- [x] Validaciones de transición de estados

## Gestión de Transferencias
- [x] Listar transferencias del cliente/empresa
- [x] Crear transferencia (validar saldo suficiente)
- [x] Flujo de aprobación para transferencias de alto monto (>umbral)
- [x] Aprobar/Rechazar transferencia (Supervisor Empresa)
- [x] Vencimiento automático de transferencias pendientes (>60 min)

## Bitácora de Operaciones
- [x] Registrar eventos en bitácora (desembolso, aprobación, transferencia, vencimiento)
- [x] Pantalla de bitácora para Analista Interno
- [x] Clientes pueden ver su propia bitácora filtrada

## Dashboard por Rol
- [x] Dashboard Cliente Persona Natural
- [x] Dashboard Cliente Empresa / Empleado Empresa
- [x] Dashboard Empleado Ventanilla
- [x] Dashboard Empleado Comercial
- [x] Dashboard Supervisor Empresa
- [x] Dashboard Analista Interno

## UI/UX
- [x] Componente StatusBadge
- [x] Componente InfoCard
- [x] Componente EmptyState
- [x] Componente ConfirmModal
- [x] Componente FormField
- [x] Navegación por tabs adaptada al rol
- [x] Datos de prueba (seed) para demostración

## Pruebas
- [x] Pruebas unitarias de lógica bancaria (25 tests pasando)
