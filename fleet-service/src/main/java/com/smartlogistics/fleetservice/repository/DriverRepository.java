package com.smartlogistics.fleetservice.repository;

import com.smartlogistics.fleetservice.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    // Cette méthode magique permet de trouver un livreur par sa zone
    // L'IA va demander : "Donne-moi le livreur de la Zone 1"
    Driver findByAssignedZoneId(Integer zoneId);
}