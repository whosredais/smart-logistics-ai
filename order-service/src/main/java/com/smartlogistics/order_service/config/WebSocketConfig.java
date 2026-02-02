package com.smartlogistics.order_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Point de connexion pour le Frontend
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Autorise Next.js
                .withSockJS(); // Active le fallback SockJS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Le préfixe pour les messages que l'on envoie au client
        registry.enableSimpleBroker("/topic");
        // Le préfixe pour les messages que le client nous envoie (pas utilisé ici)
        registry.setApplicationDestinationPrefixes("/app");
    }
}