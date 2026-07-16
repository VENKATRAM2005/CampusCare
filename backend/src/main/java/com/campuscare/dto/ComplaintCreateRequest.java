package com.campuscare.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ComplaintCreateRequest {

    @NotBlank
    private String studentId;

    @NotBlank
    private String studentName;

    @NotBlank
    private String studentDept;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotBlank
    private String category;

    @NotBlank
    private String priority;

    @NotBlank
    private String department;

    private String imageUrl;

    private Map<String, Object> feedback;

    private List<Map<String, Object>> statusHistory;
}