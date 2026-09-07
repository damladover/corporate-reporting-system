package com.project.raporlama.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "Bearer Auth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("Kurumsal Raporlama Sistemi API")
                        .version("1.0")
                        .description("Mühendis, Şef ve Müdür hiyerarşisine dayalı raporlama sistemi uç noktaları."))
                // Swagger'a "Sisteme giriş için bu güvenlik şemasını zorunlu kıl" diyoruz
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                // Güvenlik şemasının "Bearer" ve "JWT" tipinde olduğunu tanımlıyoruz
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}