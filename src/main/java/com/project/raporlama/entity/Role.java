package com.project.raporlama.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;
    
    @Column(name = "hierarchy_level", nullable = false)
    private Integer hierarchyLevel;
    
    private String description;
}