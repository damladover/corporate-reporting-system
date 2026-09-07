package com.project.raporlama.controller;

import com.project.raporlama.entity.WorkType;
import com.project.raporlama.repository.WorkTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-types")
public class WorkTypeController {
    
    private final WorkTypeRepository workTypeRepository;

    public WorkTypeController(WorkTypeRepository workTypeRepository) {
        this.workTypeRepository = workTypeRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkType>> getAllWorkTypes() {
        return ResponseEntity.ok(workTypeRepository.findAll());
    }
}