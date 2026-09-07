package com.project.raporlama.service;

import com.project.raporlama.dto.request.LoginRequest;
import com.project.raporlama.dto.request.RegisterRequest;
import com.project.raporlama.dto.response.AuthResponse;
import com.project.raporlama.entity.Role;
import com.project.raporlama.entity.User;
import com.project.raporlama.repository.RoleRepository;
import com.project.raporlama.repository.UserRepository;
import com.project.raporlama.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Kayıt başarısız: Rol bulunamadı!"));

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Kayıt başarısız: Atanan müdür bulunamadı!"));
        }

        User chef = null;
        if (request.getChefId() != null) {
            chef = userRepository.findById(request.getChefId())
                    .orElseThrow(() -> new RuntimeException("Kayıt başarısız: Atanan şef bulunamadı!"));
        }

        // 8 haneli rastgele sicil numarası üretme (10000000 ile 99999999 arası)
        String otomatikSicilNo = String.valueOf((int) (Math.random() * 90000000) + 10000000);

        User user = new User();
        user.setSicilNo(otomatikSicilNo);
        user.setAdSoyad(request.getAdSoyad());
        user.setEmail(request.getEmail());
        user.setSifreHash(passwordEncoder.encode(request.getSifre()));
        user.setRole(role);
        user.setManager(manager);
        user.setChef(chef); // Şef ataması eklendi

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .adSoyad(user.getAdSoyad())
                .role(role.getRoleName())
                .id(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .adSoyad(user.getAdSoyad())
                .role(user.getRole().getRoleName())
                .build();
    }
}