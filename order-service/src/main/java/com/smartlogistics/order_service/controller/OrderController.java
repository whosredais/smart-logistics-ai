package com.smartlogistics.order_service.controller;

import com.smartlogistics.order_service.model.Order;
import com.smartlogistics.order_service.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // Import nécessaire pour lire le JSON flexible

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // POST : Créer une commande
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderRepository.save(order);
        rabbitTemplate.convertAndSend("orders.queue", savedOrder); // Envoie l'objet directement (converti en JSON)
        System.out.println("📤 Commande envoyée à RabbitMQ : ID " + savedOrder.getId());
        return ResponseEntity.ok(savedOrder);
    }

    // PUT : Mettre à jour la zone, l'index ET le livreur (Appelé par Python)
    @PutMapping("/{id}/zone")
    public ResponseEntity<Order> updateOrderZone(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return orderRepository.findById(id)
                .map(order -> {
                    // 1. Mise à jour de la Zone
                    if (payload.containsKey("zoneId")) {
                        order.setZoneId((Integer) payload.get("zoneId"));
                    }
                    
                    // 2. Mise à jour de l'Ordre de passage (TSP)
                    if (payload.containsKey("deliveryIndex")) {
                        order.setDeliveryIndex((Integer) payload.get("deliveryIndex"));
                    }

                    // 3. Mise à jour du Livreur (CORRECTIF ICI)
                    if (payload.containsKey("driverName")) {
                        order.setDriverName((String) payload.get("driverName"));
                    }

                    // Changement de statut
                    order.setStatus(com.smartlogistics.order_service.model.OrderStatus.ASSIGNED);
                    
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
}