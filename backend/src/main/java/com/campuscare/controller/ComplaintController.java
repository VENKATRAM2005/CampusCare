package com.campuscare.controller;

import com.campuscare.entity.Complaint;
import com.campuscare.repository.ComplaintRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintRepository complaintRepository;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestBody Complaint complaint) {
        return complaintRepository.findById(id)
            .map(existingComplaint -> {
                existingComplaint.setTitle(complaint.getTitle());
                existingComplaint.setDescription(complaint.getDescription());
                existingComplaint.setCategory(complaint.getCategory());
                existingComplaint.setPriority(complaint.getPriority());
                existingComplaint.setStatus(complaint.getStatus());
                existingComplaint.setDepartment(complaint.getDepartment());
                existingComplaint.setEscalatedToAdmin(complaint.getEscalatedToAdmin());
                existingComplaint.setEscalatedToHOD(complaint.getEscalatedToHOD());
                existingComplaint.setAdminRemarks(complaint.getAdminRemarks());
                existingComplaint.setMentorRemarks(complaint.getMentorRemarks());
                existingComplaint.setFeedback(complaint.getFeedback());
                existingComplaint.setImageUrl(complaint.getImageUrl());
                existingComplaint.setResolvedByRole(complaint.getResolvedByRole());
                existingComplaint.setStatusHistory(complaint.getStatusHistory());
                existingComplaint.setUpdatedAt(LocalDateTime.now());

                Complaint savedComplaint = complaintRepository.save(existingComplaint);
                return ResponseEntity.ok(savedComplaint);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        if (!complaintRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        complaintRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
