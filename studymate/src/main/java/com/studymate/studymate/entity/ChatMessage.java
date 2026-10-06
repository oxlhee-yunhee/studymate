package com.studymate.studymate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 스터디 단체 채팅 메시지
 * 채팅방은 스터디와 1:1 관계이므로 studyId가 곧 방 식별자다.
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_study_created", columnList = "studyId, createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studyId;

    private String senderId;   // SYSTEM 메시지는 null

    private String senderName; // 전송 시점의 이름 스냅샷 (탈퇴해도 표시 유지)

    @Column(length = 2000)
    private String content;

    private String type; // TALK, SYSTEM

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
