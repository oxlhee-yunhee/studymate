package com.studymate.studymate.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

/**
 * STOMP CONNECT 프레임의 Authorization 헤더를 검증해 세션에 사용자를 묶는다.
 *
 * 이후 SEND 프레임의 발신자는 payload가 아니라 이 Principal에서 가져오므로,
 * 남의 이름으로 메시지를 보내는 것이 불가능하다.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String header = accessor.getFirstNativeHeader("Authorization");

            if (header == null || !header.startsWith("Bearer ")) {
                throw new MessagingException("채팅 연결에는 인증 토큰이 필요합니다.");
            }

            try {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(header.substring(7).trim());
                if (!decoded.isEmailVerified()) {
                    throw new MessagingException("이메일 인증이 완료되지 않은 계정입니다.");
                }
                accessor.setUser(new UsernamePasswordAuthenticationToken(
                        decoded.getUid(), null, AuthorityUtils.NO_AUTHORITIES));
            } catch (MessagingException e) {
                throw e;
            } catch (Exception e) {
                throw new MessagingException("유효하지 않은 인증 토큰입니다.");
            }
        }

        return message;
    }
}
