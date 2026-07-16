package com.campuscare.complaint.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ComplaintResponse {

    private Long id;

    private String studentId;

    private String studentName;

    private String studentDept;

    private String title;

    private String description;

    private String category;

    private String priority;

    private String status;

    private String department;

    private Boolean escalatedToAdmin;

    private Boolean escalatedToHOD;

    private String adminRemarks;

    private String mentorRemarks;

    private Map<String, Object> feedback;

    private String imageUrl;

    private String resolvedByRole;

    private List<Map<String, Object>> statusHistory;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}