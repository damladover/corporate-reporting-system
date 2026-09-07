package com.project.raporlama.controller;

import com.project.raporlama.dto.request.LoginRequest;
import com.project.raporlama.dto.request.RegisterRequest;
import com.project.raporlama.dto.response.AuthResponse;
import com.project.raporlama.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // React portu ile eşitlendi
@RequestMapping("/api/auth")
@Tag(name = "0. Kimlik Doğrulama (Auth) API", description = "Sisteme kayıt olma ve JWT Token alarak giriş yapma işlemleri")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "1. Yeni Kullanıcı Kaydı", description = "Sisteme yeni bir mühendis, şef veya müdür kaydeder.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "2. Giriş Yap ve Token Al", description = "E-posta ve şifre ile sisteme giriş yapıp yetkilendirme için kullanılacak dijital anahtarı (JWT) döner.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}