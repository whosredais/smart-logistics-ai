package com.smartlogistics.order_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 1. Définition de la Queue (File d'attente)
    @Bean
    public Queue orderQueue() {
        // "true" signifie que la queue survit au redémarrage de RabbitMQ
        return new Queue("orders.queue", true);
    }

    // 2. Définition de l'Exchange (Le centre de tri)
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange("logistics.exchange");
    }

    // 3. Liaison (Binding) : Tout ce qui a l'étiquette "order.created" va dans "orders.queue"
    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("order.created");
    }

    // 4. Convertisseur JSON (Pour envoyer des objets Java lisibles par Python)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}