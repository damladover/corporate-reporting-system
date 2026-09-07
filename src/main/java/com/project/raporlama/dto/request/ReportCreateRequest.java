package com.project.raporlama.dto.request;
import java.util.List;
import lombok.Data;

@Data
public class ReportCreateRequest {
    List<String> maddeler;
    private Long projectId; 
    private Long workTypeId; 
    
}