package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.UserRepository;
import com.jobpazar.backend.service.IMailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.jobpazar.backend.repository.JobRepository jobRepository;

    @Autowired
    private com.jobpazar.backend.repository.ProposalRepository proposalRepository;

    @Autowired
    private IMailService mailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        if (user.getRole() == null) {
            user.setRole("EMPLOYER"); // Default role
        }

        userRepository.save(user);

        // Send welcome email
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                String subject = "Welcome to JobPazar!";
                String body = "Dear " + user.getUsername() + ",\n\n" +
                        "Welcome to JobPazar - Your Freelancer Marketplace!\n\n" +
                        "You have successfully registered. You can now:\n" +
                        "- Post jobs as an employer\n" +
                        "- Apply for jobs as a freelancer\n" +
                        "- Connect with talented professionals\n\n" +
                        "Best regards,\n" +
                        "JobPazar Team";
                mailService.sendEmail(user.getEmail(), subject, body);
            }
        } catch (Exception e) {
            System.err.println("Welcome email failed: " + e.getMessage());
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.status(401).body("Invalid username or password");
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> request) {
        String userIdStr = request.get("userId");
        String username = request.get("username");
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (userIdStr == null || currentPassword == null) {
            return ResponseEntity.badRequest().body("User ID and current password are required");
        }

        Long userId = Long.parseLong(userIdStr);
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        // Verify Current Password
        if (!user.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(401).body("Incorrect current password");
        }

        // Update Fields
        if (username != null && !username.isEmpty()) {
            // Check if username is taken by another user
            Optional<User> existing = userRepository.findByUsername(username);
            if (existing.isPresent() && !existing.get().getId().equals(userId)) {
                return ResponseEntity.badRequest().body("Username already taken");
            }
            user.setUsername(username);
        }

        if (email != null && !email.isEmpty()) {
            user.setEmail(email);
        }

        // Handle Bio Update (Can be empty to clear it)
        String bio = request.get("bio");
        if (bio != null) {
            user.setBio(bio);
        }

        if (newPassword != null && !newPassword.isEmpty()) {
            user.setPassword(newPassword);
        }

        userRepository.save(user);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-account")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteAccount(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        // Verify Password
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Incorrect password");
        }

        try {
            // 1. Delete all proposals made by this user
            java.util.List<com.jobpazar.backend.entity.Proposal> myProposals = proposalRepository
                    .findAllByFreelancerId(user.getId());
            proposalRepository.deleteAll(myProposals);

            // 2. Delete all jobs posted by this user (and proposals on those jobs)
            java.util.List<com.jobpazar.backend.entity.Job> myJobs = jobRepository.findAllByEmployerId(user.getId());
            for (com.jobpazar.backend.entity.Job job : myJobs) {
                // Delete proposals on this job primarily
                java.util.List<com.jobpazar.backend.entity.Proposal> proposalsOnJob = proposalRepository
                        .findAllByJobId(job.getId());
                proposalRepository.deleteAll(proposalsOnJob);

                jobRepository.delete(job);
            }

            // 3. Delete the user
            userRepository.delete(user);

            return ResponseEntity.ok("Account deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting account: " + e.getMessage());
        }
    }
}
