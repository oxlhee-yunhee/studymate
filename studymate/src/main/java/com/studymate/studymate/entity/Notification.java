package com.studymate.studymate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; // 알림 수신자

    private String type; // APPLY_RECEIVED, APPLY_APPROVED, INQUIRY_RECEIVED, INQUIRY_ANSWERED

    @Column(length = 1000)
    private String message;

    private Long relatedStudyId;
    private Long relatedInquiryId;

    @Builder.Default
    private boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
