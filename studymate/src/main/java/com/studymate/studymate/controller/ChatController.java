package com.studymate.studymate.controller;

import com.studymate.studymate.config.CurrentUser;
import com.studymate.studymate.dto.ChatRoomSummaryResponse;
import com.studymate.studymate.entity.ChatMessage;
import com.studymate.studymate.entity.ChatReadStatus;
import com.studymate.studymate.entity.Study;
import com.studymate.studymate.repository.ChatMessageRepository;
import com.studymate.studymate.repository.ChatReadStatusRepository;
import com.studymate.studymate.repository.StudyRepository;
import com.studymate.studymate.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 채팅 REST API
 * - 채팅방 목록/안읽음 수는 REST로, 실시간 메시지는 WebSocket(STOMP)으로 처리
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private StudyRepository studyRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatReadStatusRepository chatReadStatusRepository;

    @Autowired
    private ChatService chatService;

    /** 사용자가 속한 채팅방 목록 (마지막 메시지 최신순, 안읽음 수 포함) */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomSummaryResponse>> getMyRooms() {
        final String userId = CurrentUser.uid();
        List<Study> myStudies = studyRepository.findAll().stream()
                .filter(s -> chatService.isMember(s, userId))
                .collect(Collectors.toList());

        List<ChatRoomSummaryResponse> rooms = myStudies.stream()
                .map(study -> {
                    Optional<ChatMessage> last = chatMessageRepository
                            .findTopByStudyIdOrderByCreatedAtDesc(study.getId());

                    LocalDateTime lastReadAt = chatReadStatusRepository
                            .findByStudyIdAndUserId(study.getId(), userId)
                            .map(ChatReadStatus::getLastReadAt)
                            .orElse(null);

                    long unread = (lastReadAt == null)
                            ? chatMessageRepository.countByStudyId(study.getId())
                            : chatMessageRepository.countByStudyIdAndCreatedAtAfter(study.getId(), lastReadAt);

                    return ChatRoomSummaryResponse.builder()
                            .studyId(study.getId())
                            .studyTitle(study.getTitle())
                            .category(study.getCategory())
                            .representativeImage(study.getRepresentativeImage())
                            .memberCount(study.getCurrentParticipants())
                            .lastMessage(last.map(ChatMessage::getContent).orElse(null))
                            .lastMessageType(last.map(ChatMessage::getType).orElse(null))
                            .lastMessageAt(last.map(ChatMessage::getCreatedAt).orElse(null))
                            .unreadCount(unread)
                            .build();
                })
                .sorted(Comparator.comparing(
                        (ChatRoomSummaryResponse r) -> r.getLastMessageAt() == null
                                ? LocalDateTime.MIN
                                : r.getLastMessageAt()
                ).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(rooms);
    }

    /** 채팅방 메시지 히스토리 조회 (조회와 동시에 읽음 처리) */
    @GetMapping("/rooms/{studyId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long studyId) {
        final String userId = CurrentUser.uid();
        return studyRepository.findById(studyId).<ResponseEntity<?>>map(study -> {
            if (!chatService.isMember(study, userId)) {
                return ResponseEntity.status(403).body("스터디 멤버만 채팅방에 입장할 수 있습니다.");
            }
            List<ChatMessage> messages = chatMessageRepository.findByStudyIdOrderByCreatedAtAsc(studyId);
            markAsRead(studyId, userId);
            return ResponseEntity.ok(messages);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** 읽음 처리 (채팅방을 보고 있는 동안 새 메시지 수신 시 호출) */
    @PostMapping("/rooms/{studyId}/read")
    public ResponseEntity<?> markRead(@PathVariable Long studyId) {
        markAsRead(studyId, CurrentUser.uid());
        return ResponseEntity.ok().build();
    }

    /** 하단 네비게이션 배지용: 전체 안읽은 메시지 수 */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getTotalUnreadCount() {
        final String userId = CurrentUser.uid();
        long total = studyRepository.findAll().stream()
                .filter(s -> chatService.isMember(s, userId))
                .mapToLong(study -> {
                    LocalDateTime lastReadAt = chatReadStatusRepository
                            .findByStudyIdAndUserId(study.getId(), userId)
                            .map(ChatReadStatus::getLastReadAt)
                            .orElse(null);
                    return (lastReadAt == null)
                            ? chatMessageRepository.countByStudyId(study.getId())
                            : chatMessageRepository.countByStudyIdAndCreatedAtAfter(study.getId(), lastReadAt);
                })
                .sum();
        return ResponseEntity.ok(Map.of("totalUnread", total));
    }

    private void markAsRead(Long studyId, String userId) {
        ChatReadStatus status = chatReadStatusRepository
                .findByStudyIdAndUserId(studyId, userId)
                .orElseGet(() -> ChatReadStatus.builder()
                        .studyId(studyId)
                        .userId(userId)
                        .build());
        status.setLastReadAt(LocalDateTime.now());
        chatReadStatusRepository.save(status);
    }
}
