package com.project.raporlama.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Ad soyad boş bırakılamaz")
    private String adSoyad;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    @NotBlank(message = "E-posta boş bırakılamaz")
    private String email;
    
    @NotBlank(message = "Şifre boş bırakılamaz")
    private String sifre;
    
    @NotNull(message = "Rol ID boş bırakılamaz")
    private Integer roleId;
    
    private Long managerId;
    private Long chefId;
}