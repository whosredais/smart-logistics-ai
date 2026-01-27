package com.smartlogistics.order_service.model;

public enum OrderStatus {
    CREATED,    // Commande reçue
    ASSIGNED,   // Attribuée à un livreur
    DELIVERED,  // Livrée
    CANCELED    // Annulée
}   