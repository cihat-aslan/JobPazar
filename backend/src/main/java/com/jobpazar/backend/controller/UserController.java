package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.User;
import com.jobpazar.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{userId}/request-role")
    public ResponseEntity<?> requestRole(@PathVariable Long userId, @RequestParam String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRequestedRole(role);
        userRepository.save(user);

        return ResponseEntity.ok("Role request submitted successfully");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
