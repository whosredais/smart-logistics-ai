package com.smartlogistics.order_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // On autorise tout le monde (pour le dev) à lire l'API
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // Le port de Next.js
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}