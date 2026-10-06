package com.studymate.studymate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자별 채팅방 마지막 읽은 시각 (안 읽은 메시지 수 계산용)
 */
@Entity
@Table(name = "chat_read_status", uniqueConstraints = {
        @UniqueConstraint(name = "uk_chat_read_study_user", columnNames = {"studyId", "userId"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatReadStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studyId;

    private String userId;

    private LocalDateTime lastReadAt;
}
