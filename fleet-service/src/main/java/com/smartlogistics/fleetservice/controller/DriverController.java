package com.smartlogistics.fleetservice.controller;

import com.smartlogistics.fleetservice.model.Driver;
import com.smartlogistics.fleetservice.repository.DriverRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // 1. Liste de tous les livreurs
    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // 2. Trouver le livreur d'une zone spécifique (Utilisé par Python !)
    @GetMapping("/zone/{zoneId}")
    public Driver getDriverForZone(@PathVariable Integer zoneId) {
        return driverRepository.findByAssignedZoneId(zoneId);
    }

    // 3. Injection de données de test au démarrage
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Si la base est vide, on crée 2 livreurs
            if (driverRepository.count() == 0) {
                driverRepository.save(new Driver(null, "Karim", "Moto", "AVAILABLE", 0)); // Responsable Zone 0 (Bleu)
                driverRepository.save(new Driver(null, "Sarah", "Camion", "AVAILABLE", 1));  // Responsable Zone 1 (Rouge)
                System.out.println("✅ Fleet Service : Livreurs Karim et Sarah créés en BDD !");
            }
        };
    }
}