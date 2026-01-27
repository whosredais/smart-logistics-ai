package com.smartlogistics.order_service.controller;

import com.smartlogistics.order_service.model.Order;
import com.smartlogistics.order_service.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate; // <--- Injection de RabbitMQ

    // POST : Créer une commande
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        // 1. Sauvegarde en Base de Données (Postgres)
        Order savedOrder = orderRepository.save(order);

        // 2. Publication de l'événement (RabbitMQ)
        // On envoie l'objet complet. Grâce à notre config, il sera converti en JSON automatiquement.
        // Routing key : "order.created" -> va atterrir dans "orders.queue"
        rabbitTemplate.convertAndSend("logistics.exchange", "order.created", savedOrder);
        
        System.out.println("📤 Commande envoyée à RabbitMQ : ID " + savedOrder.getId());

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // PUT : Mettre à jour la zone d'une commande (Appelé par Python)
    @PutMapping("/{id}/zone")
    public ResponseEntity<Order> updateOrderZone(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> payload) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setZoneId(payload.get("zoneId")); // On change la zone
                    order.setStatus(com.smartlogistics.order_service.model.OrderStatus.ASSIGNED); // On change le statut
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}