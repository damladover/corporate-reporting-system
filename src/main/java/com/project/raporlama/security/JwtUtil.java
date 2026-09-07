package com.project.raporlama.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // 256-bit (32 byte) şifrelenmiş gizli imzamız. (Bununla token üreteceğiz ki kimse sahtesini yapamasın)
    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    // 1. Token Oluşturma (Giriş yapıldığında çalışır)
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // Token'ın kime ait olduğu (Biz e-posta veya ID koyacağız)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Token'ın veriliş saati
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Geçerlilik süresi (10 Saat)
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // Özel şifreleme algoritması
                .compact();
    }

    // 2. Token içinden kullanıcı adını (subject) çıkarma
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.getSubject());
    }

    // 3. Token geçerli mi diye doğrulama (Gelen token sahte mi veya süresi dolmuş mu?)
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // --- Yardımcı Metotlar (Arka Planda Token'ı Parçalayıp Okuyan Metotlar) ---

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, claims -> claims.getExpiration());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}