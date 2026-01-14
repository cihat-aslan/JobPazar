package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.*;
import com.jobpazar.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobDeliveryController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping("/deliver/{proposalId}")
    public ResponseEntity<?> deliverWork(@PathVariable Long proposalId, @RequestBody Map<String, String> payload) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        Job job = proposal.getJob();

        if (job.getStatus() != JobStatus.IN_PROGRESS && job.getStatus() != JobStatus.REVIEW) {
            return ResponseEntity.badRequest().body("Job is not in progress or under review.");
        }

        proposal.setDeliveryMessage(payload.get("message"));
        proposal.setDeliveryFileUrl(payload.get("fileUrl"));
        proposalRepository.save(proposal);

        job.setStatus(JobStatus.REVIEW);
        jobRepository.save(job);

        // Notify Employer
        Notification notification = new Notification();
        notification.setMessage(
                "İş Teslim Edildi: '" + job.getTitle() + "' için freelancer işi teslim etti. Lütfen inceleyin.");
        notification.setUser(job.getEmployer());
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        return ResponseEntity.ok("Work delivered successfully.");
    }

    @PostMapping("/approve/{jobId}")
    public ResponseEntity<?> approveWork(@PathVariable Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != JobStatus.REVIEW) {
            return ResponseEntity.badRequest().body("Job is not under review.");
        }

        job.setStatus(JobStatus.COMPLETED);
        jobRepository.save(job);

        // Find the accepted proposal to notify the freelancer
        // Assuming there's one accepted proposal for the job in this context, or we
        // find it via query
        // For simplicity, we can notify all proposals or just find the one that
        // delivered.
        // Better: Find the proposal that is ACCEPTED.
        Proposal acceptedProposal = proposalRepository.findAllByJobId(job.getId()).stream()
                .filter(p -> p.getStatus() == ProposalStatus.ACCEPTED)
                .findFirst()
                .orElse(null);

        if (acceptedProposal != null) {
            Notification notification = new Notification();
            notification
                    .setMessage("İş Onaylandı: '" + job.getTitle() + "' işini tamamladınız! Ödeme serbest bırakıldı.");
            notification.setUser(acceptedProposal.getFreelancer());
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok("Job approved and completed.");
    }

    @PostMapping("/revision/{jobId}")
    public ResponseEntity<?> requestRevision(@PathVariable Long jobId, @RequestBody Map<String, String> payload) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != JobStatus.REVIEW) {
            return ResponseEntity.badRequest().body("Job is not under review.");
        }

        job.setStatus(JobStatus.IN_PROGRESS);
        jobRepository.save(job);

        String feedback = payload.get("feedback");

        Proposal acceptedProposal = proposalRepository.findAllByJobId(job.getId()).stream()
                .filter(p -> p.getStatus() == ProposalStatus.ACCEPTED)
                .findFirst()
                .orElse(null);

        if (acceptedProposal != null) {
            Notification notification = new Notification();
            notification
                    .setMessage("Revize Talebi: '" + job.getTitle() + "' işi için revize istendi. Not: " + feedback);
            notification.setUser(acceptedProposal.getFreelancer());
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok("Revision requested.");
    }
}
