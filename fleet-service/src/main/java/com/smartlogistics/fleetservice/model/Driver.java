package com.smartlogistics.fleetservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data // Lombok génère les getters/setters
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;    // Ex: "Karim"
    private String vehicle; // Ex: "Moto"
    private String status;  // Ex: "AVAILABLE"
    
    // C'est le lien avec l'IA : Le livreur est responsable de la Zone X
    private Integer assignedZoneId; 
}