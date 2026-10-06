package com.studymate.studymate.service;

import com.studymate.studymate.entity.ChatMessage;
import com.studymate.studymate.entity.Study;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.ChatMessageRepository;
import com.studymate.studymate.repository.ChatReadStatusRepository;
import com.studymate.studymate.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * 채팅 도메인 공통 로직.
 * StudyController(승인/내보내기/삭제)와 ChatSocketController가 함께 사용한다.
 */
@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatReadStatusRepository chatReadStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /** 사용자가 보낸 일반 메시지 저장 + 방 구독자에게 브로드캐스트 */
    public ChatMessage sendTalkMessage(Long studyId, String senderId, String content) {
        String senderName = userRepository.findById(senderId)
                .map(User::getName)
                .orElse("알 수 없음");

        ChatMessage saved = chatMessageRepository.save(ChatMessage.builder()
                .studyId(studyId)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .type("TALK")
                .build());

        messagingTemplate.convertAndSend("/topic/chat/" + studyId, saved);
        return saved;
    }

    /** 입장/퇴장 등 시스템 메시지 저장 + 브로드캐스트 */
    public ChatMessage sendSystemMessage(Long studyId, String content) {
        ChatMessage saved = chatMessageRepository.save(ChatMessage.builder()
                .studyId(studyId)
                .senderId(null)
                .senderName(null)
                .content(content)
                .type("SYSTEM")
                .build());

        messagingTemplate.convertAndSend("/topic/chat/" + studyId, saved);
        return saved;
    }

    /** 스터디 삭제 시 채팅 데이터 전체 정리 */
    @Transactional
    public void deleteRoomData(Long studyId) {
        chatMessageRepository.deleteByStudyId(studyId);
        chatReadStatusRepository.deleteByStudyId(studyId);
    }

    /** 강제 내보내기 시 해당 사용자의 읽음 상태 제거 */
    @Transactional
    public void removeMemberReadStatus(Long studyId, String userId) {
        chatReadStatusRepository.deleteByStudyIdAndUserId(studyId, userId);
    }

    /** 채팅방 멤버(= 스터디 참여자 또는 방장) 여부 확인 */
    public boolean isMember(Study study, String userId) {
        if (userId == null) return false;
        if (userId.equals(study.getCreatorId())) return true;
        return study.getParticipantIds() != null && study.getParticipantIds().contains(userId);
    }
}
