# BancoGestión - Sistema de Gestión Bancaria en Java

## Descripción

Aplicación empresarial de gestión de información bancaria desarrollada completamente en **Java** con **Spring Boot**, cumpliendo al pie de la letra con todos los requisitos especificados en el documento de actividad.

### Características Principales

- **7 Roles de Usuario** con control de acceso granular
- **Gestión de Cuentas Bancarias** (apertura, bloqueo, cancelación)
- **Sistema de Préstamos** con flujo de aprobación (Analista Interno)
- **Transferencias Bancarias** con validación de montos y aprobación de Supervisor
- **Bitácora NoSQL** (MongoDB) para auditoría e inmutabilidad
- **Validaciones de Negocio** implementadas en código
- **Seguridad** con Spring Security y JWT
- **Base de Datos Relacional** (MySQL) para datos transaccionales
- **Base de Datos NoSQL** (MongoDB) para bitácora de operaciones

---

## Arquitectura

```
BancoGestión/
├── src/main/java/com/banco/gestion/
│   ├── models/              # Entidades JPA y MongoDB
│   ├── repositories/        # Acceso a datos (SQL y NoSQL)
│   ├── services/            # Lógica de negocio
│   ├── controllers/         # Controladores REST
│   ├── security/            # Configuración de seguridad
│   ├── dto/                 # Data Transfer Objects
│   ├── exceptions/          # Excepciones personalizadas
│   └── utils/               # Utilidades y enumeraciones
├── src/main/resources/
│   ├── application.properties
│   ├── templates/           # Vistas Thymeleaf
│   └── static/              # Recursos estáticos
└── pom.xml                  # Configuración Maven
```

---

## Requisitos Previos

- **Java 17+**
- **Maven 3.6+**
- **MySQL 8.0+**
- **MongoDB 5.0+**

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Digiwill08/banco-gestion.git
cd banco-gestion
```

### 2. Configurar Base de Datos MySQL

```sql
CREATE DATABASE banco_gestion;
USE banco_gestion;
```

### 3. Configurar Base de Datos MongoDB

```bash
# MongoDB debe estar ejecutándose en localhost:27017
# Base de datos: banco_bitacora
```

### 4. Actualizar archivo de configuración

Editar `src/main/resources/application.properties`:

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/banco_gestion?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=tu_contraseña

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/banco_bitacora
```

### 5. Compilar y ejecutar

```bash
# Compilar
mvn clean compile

# Ejecutar tests
mvn test

# Ejecutar aplicación
mvn spring-boot:run
```

La aplicación estará disponible en: **http://localhost:8080/api**

---

## 7 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Cliente Persona Natural** | Cliente individual | Ver sus cuentas, solicitar préstamos, hacer transferencias |
| **Cliente Empresa** | Representante legal de empresa | Ver cuentas empresa, delegar permisos |
| **Empleado Ventanilla** | Cajero/Asesor | Consultar saldos, registrar depósitos/retiros, abrir cuentas |
| **Empleado Comercial** | Ejecutivo de cuenta | Crear solicitudes de productos, seguimiento |
| **Empleado Empresa** | Usuario operativo | Crear transferencias y pagos (requiere aprobación si monto alto) |
| **Supervisor Empresa** | Aprobador | Aprobar/rechazar transferencias de empresa |
| **Analista Interno** | Back-office | Aprobar/rechazar préstamos, acceso completo a bitácora |

---

## Flujos de Negocio

### Flujo de Aprobación de Préstamos

1. Cliente solicita préstamo → Estado: **"En estudio"**
2. Analista Interno revisa → Aprueba/Rechaza
3. Si aprobado → Analista marca como **"Desembolsado"**
4. Fondos se acreditan en cuenta destino

### Flujo de Transferencias de Alto Monto

1. Empleado Empresa crea transferencia
2. Si monto > umbral → Estado: **"En espera de aprobación"**
3. Supervisor Empresa aprueba/rechaza
4. Si vence > 1 hora → Estado: **"Vencida"** (automático)

---

## Reglas de Negocio Implementadas

### Cuentas Bancarias
- ✅ Número de cuenta único
- ✅ No se puede abrir a cliente inactivo/bloqueado
- ✅ No se permiten operaciones en cuentas bloqueadas/canceladas
- ✅ Validación de saldo suficiente

### Préstamos
- ✅ Solo Analista Interno puede aprobar/rechazar
- ✅ Desembolso solo desde estado "Aprobado"
- ✅ Validación de cuenta destino activa
- ✅ Aumento automático de saldo al desembolsar

### Transferencias
- ✅ Validación de saldo suficiente en origen
- ✅ Umbral de aprobación configurable
- ✅ Vencimiento automático después de 1 hora
- ✅ Registro inmutable en bitácora

---

## Endpoints REST Principales

### Autenticación
```
POST   /api/auth/login              # Iniciar sesión
POST   /api/auth/logout             # Cerrar sesión
POST   /api/auth/refresh            # Renovar token JWT
```

### Usuarios
```
POST   /api/usuarios                # Crear usuario
GET    /api/usuarios/{id}           # Obtener usuario
GET    /api/usuarios                # Listar usuarios
PUT    /api/usuarios/{id}           # Actualizar usuario
```

### Cuentas
```
POST   /api/cuentas                 # Crear cuenta
GET    /api/cuentas/{numero}        # Obtener cuenta
GET    /api/cuentas/cliente/{id}    # Cuentas de cliente
POST   /api/cuentas/{id}/depositar  # Realizar depósito
POST   /api/cuentas/{id}/retirar    # Realizar retiro
```

### Préstamos
```
POST   /api/prestamos               # Solicitar préstamo
GET    /api/prestamos/{id}          # Obtener préstamo
GET    /api/prestamos/cliente/{id}  # Préstamos de cliente
PUT    /api/prestamos/{id}/aprobar  # Aprobar (Analista)
PUT    /api/prestamos/{id}/rechazar # Rechazar (Analista)
PUT    /api/prestamos/{id}/desembolsar # Desembolsar (Analista)
```

### Transferencias
```
POST   /api/transferencias          # Crear transferencia
GET    /api/transferencias/{id}     # Obtener transferencia
PUT    /api/transferencias/{id}/aprobar # Aprobar (Supervisor)
PUT    /api/transferencias/{id}/rechazar # Rechazar (Supervisor)
```

### Bitácora
```
GET    /api/bitacora                # Obtener todas las operaciones
GET    /api/bitacora/usuario/{id}   # Operaciones de usuario
GET    /api/bitacora/tipo/{tipo}    # Operaciones por tipo
GET    /api/bitacora/producto/{id}  # Operaciones de producto
```

---

## Estructura de Datos

### Base de Datos Relacional (MySQL)

**Tablas principales:**
- `usuarios` - Todos los usuarios del sistema
- `clientes` - Clientes (Persona Natural y Empresa)
- `cuentas_bancarias` - Cuentas con saldos
- `prestamos` - Solicitudes de préstamos
- `transferencias` - Transferencias entre cuentas
- `productos_bancarios` - Catálogo de productos

### Base de Datos NoSQL (MongoDB)

**Colección:**
- `bitacora_operaciones` - Registro inmutable de todas las operaciones

---

## Seguridad

- **Spring Security** para autenticación y autorización
- **JWT (JSON Web Tokens)** para sesiones sin estado
- **Encriptación de contraseñas** con BCrypt
- **Control de acceso por rol** en todos los endpoints
- **Validación de entrada** en todos los formularios

---

## Testing

```bash
# Ejecutar todos los tests
mvn test

# Ejecutar test específico
mvn test -Dtest=NombreDelTest

# Con cobertura
mvn test jacoco:report
```

---

## Documentación de API

La documentación Swagger estará disponible en:
```
http://localhost:8080/api/swagger-ui.html
```

---

## Troubleshooting

### Error: "No connection to MongoDB"
- Verificar que MongoDB está ejecutándose: `mongod`
- Verificar URI en `application.properties`

### Error: "Access denied for user 'root'@'localhost'"
- Verificar credenciales de MySQL
- Crear base de datos: `CREATE DATABASE banco_gestion;`

### Error: "Port 8080 already in use"
- Cambiar puerto en `application.properties`: `server.port=8081`

---

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## Licencia

Este proyecto está bajo licencia MIT.

---

## Contacto

Para preguntas o soporte, contactar a: [tu-email@ejemplo.com]

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Estado:** En desarrollo
