package com.jobpazar.backend.controller;

import com.jobpazar.backend.entity.Notification;
import com.jobpazar.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<java.util.Map<String, Object>>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<java.util.Map<String, Object>> result = notifications.stream().map(n -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", n.getId());
            map.put("message", n.getMessage());
            map.put("isRead", n.isRead());
            map.put("createdAt", n.getCreatedAt());
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
