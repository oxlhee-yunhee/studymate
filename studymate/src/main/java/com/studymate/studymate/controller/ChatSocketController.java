package com.studymate.studymate.controller;

import com.studymate.studymate.dto.ChatMessageRequest;
import com.studymate.studymate.repository.StudyRepository;
import com.studymate.studymate.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket(STOMP) 채팅 메시지 핸들러
 *
 * 클라이언트: /app/chat/{studyId} 로 발행 → 서버가 저장 후 /topic/chat/{studyId} 로 브로드캐스트
 *
 * 발신자는 payload의 senderId가 아니라 CONNECT 시 인증된 Principal에서 가져온다.
 */
@Controller
public class ChatSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private StudyRepository studyRepository;

    @MessageMapping("/chat/{studyId}")
    public void handleMessage(@DestinationVariable Long studyId,
                              @Payload ChatMessageRequest request,
                              Principal principal) {

        if (principal == null) {
            return; // 인증되지 않은 세션
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return;
        }

        String senderId = principal.getName();

        // 멤버 검증: 스터디 참여자만 메시지 전송 가능
        studyRepository.findById(studyId).ifPresent(study -> {
            if (chatService.isMember(study, senderId)) {
                chatService.sendTalkMessage(studyId, senderId, request.getContent().trim());
            }
        });
    }
}
