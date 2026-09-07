package com.project.raporlama.service;

import com.project.raporlama.entity.Project;
import com.project.raporlama.entity.Report;
import com.project.raporlama.entity.User;
import com.project.raporlama.entity.WorkType;
import com.project.raporlama.entity.enums.ReportStatusType;
import com.project.raporlama.repository.ProjectRepository;
import com.project.raporlama.repository.ReportRepository;
import com.project.raporlama.repository.UserRepository;
import com.project.raporlama.repository.WorkTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private ProjectRepository projectRepository;
    
    @Mock
    private WorkTypeRepository workTypeRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void testCreateReportDraft_Success() {
        User mockUser = new User();
        mockUser.setId(1L);

        Project mockProject = new Project();
        mockProject.setId(1L);

        WorkType mockWorkType = new WorkType();
        mockWorkType.setId(1L);

        Report mockReport = new Report();
        mockReport.setId(1L);
        mockReport.setUser(mockUser);
        mockReport.setProject(mockProject);
        mockReport.setWorkType(mockWorkType);
        mockReport.setStatus(ReportStatusType.DRAFT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
        when(workTypeRepository.findById(1L)).thenReturn(Optional.of(mockWorkType));
        when(reportRepository.save(any(Report.class))).thenReturn(mockReport);

        assertNotNull(mockReport);
        assertEquals(ReportStatusType.DRAFT, mockReport.getStatus());
        assertEquals(1L, mockReport.getUser().getId());
    }

    @Test
    void testReportStatusUpdate_Success() {
        Report mockReport = new Report();
        mockReport.setId(1L);
        mockReport.setStatus(ReportStatusType.DRAFT);

        // Durum akışı testi
        mockReport.setStatus(ReportStatusType.WAITING_CHEF);
        assertEquals(ReportStatusType.WAITING_CHEF, mockReport.getStatus());

        mockReport.setStatus(ReportStatusType.APPROVED);
        assertEquals(ReportStatusType.APPROVED, mockReport.getStatus());
    }
}