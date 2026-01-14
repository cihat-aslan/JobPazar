package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.Job;
import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.JobRepository;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private com.jobpazar.backend.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.jobpazar.backend.repository.FeedbackRepository feedbackRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalJobs", jobRepository.count());
        // Simple counts for now
        return ResponseEntity.ok(stats);
    }

    @org.springframework.web.bind.annotation.PostMapping("/feedback/reply")
    public ResponseEntity<?> replyToFeedback(
            @org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {

        // We expect feedbackId to be present to mark it as replied
        Object feedbackIdObj = payload.get("feedbackId");
        String replyMessage = (String) payload.get("reply");

        if (feedbackIdObj == null || replyMessage == null) {
            return ResponseEntity.badRequest().body("feedbackId ve reply alanları zorunludur.");
        }

        Long feedbackId = Long.valueOf(feedbackIdObj.toString());

        com.jobpazar.backend.entity.Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setReplied(true);
        feedback.setReply(replyMessage);
        feedbackRepository.save(feedback);

        User user = feedback.getUser();
        if (user == null) {
            // Fallback if user was somehow deleted but feedback exists? or checking userId
            // from payload if strictly needed
            // For now assuming feedback has user
            return ResponseEntity.badRequest().body("Feedback user is missing.");
        }

        com.jobpazar.backend.entity.Notification notification = new com.jobpazar.backend.entity.Notification();
        notification.setUser(user);
        notification.setMessage("Yönetici Yanıtı: " + replyMessage);

        notificationRepository.save(notification);

        return ResponseEntity.ok("Yanıt gönderildi ve bildirim oluşturuldu.");
    }

    @org.springframework.web.bind.annotation.PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }

        if (updates.containsKey("password") && updates.get("password") != null && !updates.get("password").isEmpty()) {
            // In a real app, use PasswordEncoder here!
            user.setPassword(updates.get("password"));
        }

        if (updates.containsKey("bio")) {
            user.setBio(updates.get("bio"));
        }

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@org.springframework.web.bind.annotation.PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@org.springframework.web.bind.annotation.PathVariable Long id) {
        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job deleted successfully");
    }
}
