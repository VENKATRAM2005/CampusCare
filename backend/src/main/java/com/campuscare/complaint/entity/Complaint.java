package com.campuscare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;

    private String studentName;

    private String studentDept;

    private String title;

    @Column(length = 2000)
    private String description;

    private String category;

    private String priority;

    private String status;

    private String department;

    private Boolean escalatedToAdmin;

    private Boolean escalatedToHOD;

    @Column(length = 2000)
    private String adminRemarks;

    @Column(length = 2000)
    private String mentorRemarks;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> feedback;

    @Column(length = 5000)
    private String imageUrl;

    private String resolvedByRole;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> statusHistory;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
