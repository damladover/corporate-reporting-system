package com.project.raporlama.repository;

import com.project.raporlama.entity.Report;
import com.project.raporlama.entity.enums.ReportStatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    
    
    List<Report> findByStatus(ReportStatusType status);
    List<Report> findByStatusIn(List<ReportStatusType> statuses);

    // Belirli rapor ID listesindeki bekleyen raporları getirmek için
    List<Report> findByIdInAndStatus(List<Long> ids, ReportStatusType status);

    List<Report> findByUserId(Long userId);

    
}