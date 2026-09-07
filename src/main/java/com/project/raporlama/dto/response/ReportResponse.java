package com.project.raporlama.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.raporlama.entity.ReportItem;

@Data
@Builder
public class ReportResponse {
    
    private Long id;
    private String raportorIsim;
    
    private LocalDate raporTarihi;
    private String status;
    private String redSebebi;
    private LocalDateTime guncellenmeTarihi;

    private String projectName;
    private String workTypeName;
    private Long parentReportId;
    private Integer hafta;
    private Integer yil;
    private List<ReportItem> maddeler;
}