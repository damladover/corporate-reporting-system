package com.project.raporlama.entity;

import com.project.raporlama.entity.enums.ReportStatusType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Project project;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_type_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private WorkType workType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_report_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Report parentReport;
    
    @Column(name = "raportor_isim", nullable = false)
    private String raportorIsim;
    
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportItem> maddeler = new java.util.ArrayList<>();

    // Tarihsel ve haftalık takip için
    private Integer hafta;
    private Integer yil;
    
    @Column(name = "rapor_tarihi", nullable = false)
    private LocalDate raporTarihi;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatusType status;
    
    @Column(name = "red_sebebi", columnDefinition = "TEXT")
    private String redSebebi;
    
    @Column(name = "guncellenme_tarihi")
    private LocalDateTime guncellenmeTarihi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_id")
    private User chef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;
}