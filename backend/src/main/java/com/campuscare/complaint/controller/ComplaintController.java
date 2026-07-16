package com.campuscare.controller;

import com.campuscare.entity.Complaint;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.service.ComplaintService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintService.createComplaint(complaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(
            @PathVariable Long id,
            @RequestBody Complaint complaint) {

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