package com.project.raporlama.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // BU IMPORTU EKLE
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "report_items")
@Data
public class ReportItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String icerik;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    @JsonIgnore // BU ANOTASYONU EKLEYEREK SONSUZ DÖNGÜYÜ ENGELLİYORUZ
    private Report report;
}