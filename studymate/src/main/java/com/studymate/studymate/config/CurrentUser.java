package com.studymate.studymate.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 현재 요청을 수행 중인 사용자(Firebase uid)를 꺼내는 헬퍼.
 *
 * FirebaseAuthFilter가 Authorization 헤더의 ID 토큰을 검증한 뒤
 * SecurityContext에 uid를 principal로 넣어둔다.
 * 컨트롤러는 클라이언트가 보낸 userId 파라미터 대신 반드시 이 값을 사용해야 한다.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    /** 인증된 사용자의 uid. 인증되지 않았다면 null. */
    public static String uid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            return null;
        }
        return principal.toString();
    }
}
