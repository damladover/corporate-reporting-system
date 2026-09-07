package com.project.raporlama.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sicil_no", nullable = false, unique = true)
    private String sicilNo;
    
    @Column(name = "ad_soyad", nullable = false)
    private String adSoyad;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @JsonIgnore // Güvenlik açığı olmaması için şifre frontend'e gönderilmemeli
    @Column(name = "sifre_hash", nullable = false)
    private String sifreHash;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User chef;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User manager; 
}