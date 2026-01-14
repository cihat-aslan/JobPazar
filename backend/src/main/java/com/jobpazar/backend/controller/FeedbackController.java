package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.Feedback;
import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.FeedbackRepository;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody Map<String, Object> payload) {
        try {
            String message = (String) payload.get("message");
            Object userIdObj = payload.get("userId");

            if (userIdObj == null) {
                return ResponseEntity.badRequest().body("User ID is required.");
            }

            Long userId = Long.valueOf(userIdObj.toString());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = new Feedback();
            feedback.setMessage(message);
            feedback.setUser(user);
            feedback.setCreatedAt(java.time.LocalDateTime.now());

            feedbackRepository.save(feedback);
            return ResponseEntity.ok(Map.of("message", "Feedback received"));
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        // In a real app, this should be secured for ADMIN only
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}
