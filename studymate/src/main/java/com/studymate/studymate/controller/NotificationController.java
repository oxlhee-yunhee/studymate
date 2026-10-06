package com.studymate.studymate.controller;

import com.studymate.studymate.config.CurrentUser;
import com.studymate.studymate.entity.Notification;
import com.studymate.studymate.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getNotifications(@PathVariable String userId) {
        if (!userId.equals(CurrentUser.uid())) {
            return ResponseEntity.status(403).body("본인의 알림만 조회할 수 있습니다.");
        }
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String userId) {
        if (!userId.equals(CurrentUser.uid())) {
            return ResponseEntity.status(403).body("본인의 알림만 조회할 수 있습니다.");
        }
        return ResponseEntity.ok(Map.of("count", notificationRepository.countByUserIdAndIsReadFalse(userId)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).<ResponseEntity<?>>map(notification -> {
            if (!notification.getUserId().equals(CurrentUser.uid())) {
                return ResponseEntity.status(403).body("본인의 알림만 읽음 처리할 수 있습니다.");
            }
            notification.setRead(true);
            return ResponseEntity.ok(notificationRepository.save(notification));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        if (!userId.equals(CurrentUser.uid())) {
            return ResponseEntity.status(403).body("본인의 알림만 읽음 처리할 수 있습니다.");
        }
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
}
