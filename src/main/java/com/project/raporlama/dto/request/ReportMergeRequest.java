package com.project.raporlama.dto.request;

import lombok.Data;
import org.springframework.lang.NonNull;
import java.util.List;

@Data
public class ReportMergeRequest {
    @NonNull
    private List<Long> reportIds;
    
    @NonNull
    private Long projectId;

    List<Long> secilenMaddeIdleri;

    
}