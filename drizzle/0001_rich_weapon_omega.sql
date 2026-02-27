CREATE TABLE `bank_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authUserId` int,
	`idRelacionado` varchar(64),
	`nombreCompleto` varchar(255) NOT NULL,
	`idIdentificacion` varchar(64) NOT NULL,
	`correoElectronico` varchar(320) NOT NULL,
	`telefono` varchar(20) NOT NULL,
	`fechaNacimiento` timestamp,
	`direccion` text NOT NULL,
	`rolSistema` enum('cliente_persona','cliente_empresa','empleado_ventanilla','empleado_comercial','empleado_empresa','supervisor_empresa','analista_interno') NOT NULL,
	`estadoUsuario` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
	`passwordHash` varchar(255) NOT NULL,
	`empresaId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `bank_users_idIdentificacion_unique` UNIQUE(`idIdentificacion`)
);
--> statement-breakpoint
CREATE TABLE `bitacora` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoOperacion` varchar(100) NOT NULL,
	`fechaHoraOperacion` timestamp NOT NULL DEFAULT (now()),
	`idUsuario` int NOT NULL,
	`rolUsuario` varchar(64) NOT NULL,
	`idProductoAfectado` varchar(64) NOT NULL,
	`datosDetalle` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bitacora_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes_empresa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankUserId` int NOT NULL,
	`razonSocial` varchar(255) NOT NULL,
	`nit` varchar(64) NOT NULL,
	`correoElectronico` varchar(320) NOT NULL,
	`telefono` varchar(20) NOT NULL,
	`direccion` text NOT NULL,
	`representanteLegalId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_empresa_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_empresa_nit_unique` UNIQUE(`nit`)
);
--> statement-breakpoint
CREATE TABLE `clientes_persona` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankUserId` int NOT NULL,
	`nombreCompleto` varchar(255) NOT NULL,
	`numeroIdentificacion` varchar(64) NOT NULL,
	`correoElectronico` varchar(320) NOT NULL,
	`telefono` varchar(20) NOT NULL,
	`fechaNacimiento` timestamp NOT NULL,
	`direccion` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_persona_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_persona_numeroIdentificacion_unique` UNIQUE(`numeroIdentificacion`)
);
--> statement-breakpoint
CREATE TABLE `cuentas_bancarias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroCuenta` varchar(20) NOT NULL,
	`tipoCuenta` enum('ahorros','corriente','personal','empresarial') NOT NULL,
	`idTitular` varchar(64) NOT NULL,
	`saldoActual` decimal(15,2) NOT NULL DEFAULT '0.00',
	`moneda` enum('COP','USD','EUR') NOT NULL DEFAULT 'COP',
	`estadoCuenta` enum('activa','bloqueada','cancelada') NOT NULL DEFAULT 'activa',
	`fechaApertura` timestamp NOT NULL DEFAULT (now()),
	`abiertaPorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cuentas_bancarias_id` PRIMARY KEY(`id`),
	CONSTRAINT `cuentas_bancarias_numeroCuenta_unique` UNIQUE(`numeroCuenta`)
);
--> statement-breakpoint
CREATE TABLE `prestamos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoPrestamo` enum('personal','hipotecario','vehiculo','empresarial','consumo') NOT NULL,
	`idClienteSolicitante` varchar(64) NOT NULL,
	`montoSolicitado` decimal(15,2) NOT NULL,
	`montoAprobado` decimal(15,2),
	`tasaInteres` decimal(5,2),
	`plazoMeses` int NOT NULL,
	`estadoPrestamo` enum('en_estudio','aprobado','rechazado','desembolsado') NOT NULL DEFAULT 'en_estudio',
	`fechaAprobacion` timestamp,
	`fechaDesembolso` timestamp,
	`cuentaDestinoDesembolso` varchar(20),
	`creadoPorId` int NOT NULL,
	`aprobadoPorId` int,
	`motivoRechazo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prestamos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productos_bancarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigoProducto` varchar(20) NOT NULL,
	`nombreProducto` varchar(255) NOT NULL,
	`categoria` enum('cuentas','prestamos','servicios') NOT NULL,
	`requiereAprobacion` boolean NOT NULL DEFAULT false,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productos_bancarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `productos_bancarios_codigoProducto_unique` UNIQUE(`codigoProducto`)
);
--> statement-breakpoint
CREATE TABLE `transferencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cuentaOrigen` varchar(20) NOT NULL,
	`cuentaDestino` varchar(20) NOT NULL,
	`monto` decimal(15,2) NOT NULL,
	`fechaCreacion` timestamp NOT NULL DEFAULT (now()),
	`fechaAprobacion` timestamp,
	`estadoTransferencia` enum('ejecutada','en_espera_aprobacion','rechazada','vencida') NOT NULL DEFAULT 'ejecutada',
	`idUsuarioCreador` int NOT NULL,
	`idUsuarioAprobador` int,
	`concepto` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transferencias_id` PRIMARY KEY(`id`)
);
