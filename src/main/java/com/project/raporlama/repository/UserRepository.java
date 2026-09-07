package com.project.raporlama.repository;

import com.project.raporlama.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Login (Giriş) işlemleri için e-posta ile kullanıcı arama
    Optional<User> findByEmail(String email);

    // User entity sınıfında rol alanı nesne (Role role) olduğu için 
    // Spring Data JPA türetilmiş sorgusu alt çizgi ile yazılmalıdır:
    List<User> findByRole_Id(Integer roleId);
}