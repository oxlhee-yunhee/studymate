package com.studymate.studymate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 채팅 목록 화면에 표시할 채팅방 요약 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomSummaryResponse {
    private Long studyId;
    private String studyTitle;
    private String category;
    private String representativeImage;
    private Integer memberCount;
    private String lastMessage;
    private String lastMessageType;      // TALK, SYSTEM
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
