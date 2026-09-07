package com.project.raporlama.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tipAd; // Geliştirme, Toplantı, Talep
}