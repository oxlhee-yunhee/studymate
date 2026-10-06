package com.studymate.studymate.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 모든 요청의 Authorization: Bearer &lt;Firebase ID 토큰&gt; 헤더를 검증하는 필터.
 *
 * 검증에 성공하면 SecurityContext에 uid를 principal로 저장한다.
 * 실패하거나 헤더가 없으면 인증 정보를 남기지 않고,
 * SecurityConfig의 authorizeHttpRequests 규칙에 따라 401로 처리된다.
 */
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String idToken = header.substring(7).trim();
            try {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);

                // 이메일 인증을 마친 계정만 인증된 사용자로 인정한다.
                if (decoded.isEmailVerified()) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    decoded.getUid(), null, AuthorityUtils.NO_AUTHORITIES);
                    authentication.setDetails(decoded.getEmail());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // 위조/만료 토큰: 인증 없음으로 두고 진행 (아래 인가 단계에서 401)
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
