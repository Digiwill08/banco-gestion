package com.banco.gestion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Aplicación principal de BancoGestión
 * Sistema de Gestión de Información Bancaria
 */
@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = "com.banco.gestion")
public class BancoGestionApplication {

    public static void main(String[] args) {
        SpringApplication.run(BancoGestionApplication.class, args);
        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║        BancoGestión - Sistema de Gestión Bancaria          ║");
        System.out.println("║                    v1.0.0 - Iniciado                       ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
    }
}
