package com.smartlogistics.order_service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

@SpringBootApplication
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    // Ce code s'exécute une fois que l'app est lancée
    @Bean
    CommandLineRunner testRabbitMQ(RabbitTemplate rabbitTemplate) {
        return args -> {
            System.out.println("🐇 Test de connexion RabbitMQ...");
            // On envoie un message simple pour forcer la création de la queue
            rabbitTemplate.convertAndSend("orders.queue", "{ \"test\": \"Hello Rabbit!\" }");
            System.out.println("✅ Message envoyé à RabbitMQ !");
        };
    }
}