package com.project.raporlama.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        // 1. İstek (Request) içindeki "Authorization" başlığını oku
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Başlık doluysa ve "Bearer " kelimesiyle başlıyorsa (Sektör standardı)
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // "Bearer " kısmını at, sadece şifreli metni al
            username = jwtUtil.extractUsername(jwt); // JwtUtil yardımıyla şifreyi çöz ve kim olduğunu bul
        }

        // 3. Kullanıcı adı bulunduysa ve şu anki sistemde henüz onaylanmamışsa
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Veritabanından bu kullanıcıyı bul
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 4. Token hala geçerliyse, kullanıcıya "Geçebilirsin" vizesi (Authentication) ver
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Vizeyi güvenlik sisteminin hafızasına kaydet ki içeride rahatça dolaşabilsin
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 5. Kontrol bittikten sonra kapıyı aç ve isteğin (request) yoluna devam etmesine izin ver
        chain.doFilter(request, response);
    }
}