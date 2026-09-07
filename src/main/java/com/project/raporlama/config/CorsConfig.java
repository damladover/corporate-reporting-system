package com.project.raporlama.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**") // Tüm API uçlarına izin ver
                        .allowedOrigins("*") // Herhangi bir kaynaktan gelen isteğe açık ol
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS"); // Tüm HTTP metotları serbest
            }
        };
    }
}