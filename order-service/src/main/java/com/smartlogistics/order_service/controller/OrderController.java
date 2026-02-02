package com.smartlogistics.order_service.controller;

import com.smartlogistics.order_service.model.Order;
import com.smartlogistics.order_service.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate; // <--- IMPORTANT
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // <--- Outil pour le WebSocket

    // POST : Créer
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderRepository.save(order);
        
        // 1. Envoi à RabbitMQ (Pour l'IA Python)
        rabbitTemplate.convertAndSend("orders.queue", savedOrder);
        
        // 2. Envoi au WebSocket (Pour le Frontend React)
        // On envoie sur le canal "/topic/orders"
        messagingTemplate.convertAndSend("/topic/orders", savedOrder);
        
        System.out.println("📤 Commande créée : ID " + savedOrder.getId());
        return ResponseEntity.ok(savedOrder);
    }

    // PUT : Mise à jour par l'IA
    @PutMapping("/{id}/zone")
    public ResponseEntity<Order> updateOrderZone(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return orderRepository.findById(id)
                .map(order -> {
                    if (payload.containsKey("zoneId")) order.setZoneId((Integer) payload.get("zoneId"));
                    if (payload.containsKey("deliveryIndex")) order.setDeliveryIndex((Integer) payload.get("deliveryIndex"));
                    if (payload.containsKey("driverName")) order.setDriverName((String) payload.get("driverName"));

                    order.setStatus(com.smartlogistics.order_service.model.OrderStatus.ASSIGNED);
                    Order updatedOrder = orderRepository.save(order);

                    // NOTIFICATION WEBSOCKET EN TEMPS RÉEL
                    // L'IA a mis à jour la commande -> On prévient le Frontend immédiatement
                    messagingTemplate.convertAndSend("/topic/orders", updatedOrder);

                    return ResponseEntity.ok(updatedOrder);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
}