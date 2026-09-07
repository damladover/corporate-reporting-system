package com.project.raporlama.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String adSoyad;
    private String role;
    private Long id; // Raporları çekebilmek için eklediğimiz hayati ID alanı
}