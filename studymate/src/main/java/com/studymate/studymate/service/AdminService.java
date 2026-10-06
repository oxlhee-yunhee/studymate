package com.studymate.studymate.service;

import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * 로그인 허용 범위와 관리자 권한을 한 곳에서 판단한다.
 *
 * - 학생: app.allowed-email-domain 으로 끝나는 이메일 (기본 @sch.ac.kr)
 * - 관리자: app.admin-emails 목록에 있는 이메일 (도메인 제한을 우회한다)
 *
 * 관리자 계정을 학교 이메일로 두면 졸업 후 계정이 정리될 때 관리 기능을 잃는다.
 * 그래서 관리자만은 도메인과 무관한 개인 이메일을 쓸 수 있게 하고,
 * 값은 코드가 아니라 환경변수 APP_ADMIN_EMAILS 로 관리한다.
 * (인수인계할 때도 배포 환경변수만 바꾸면 된다)
 */
@Service
public class AdminService {

    private final UserRepository userRepository;

    @Value("${app.admin-emails:}")
    private String adminEmails;

    @Value("${app.allowed-email-domain:@sch.ac.kr}")
    private String allowedEmailDomain;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** 문의 알림 수신자이자 관리자 권한을 가진 이메일 목록 */
    public List<String> adminEmails() {
        return Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .map(email -> email.toLowerCase())
                .toList();
    }

    public String allowedEmailDomain() {
        return allowedEmailDomain;
    }

    /** 가입/로그인을 허용할 이메일인가 (학교 도메인 또는 관리자) */
    public boolean isLoginAllowed(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String normalized = email.toLowerCase();
        return normalized.endsWith(allowedEmailDomain.toLowerCase()) || isAdminEmail(normalized);
    }

    public boolean isAdminEmail(String email) {
        if (email == null) {
            return false;
        }
        return adminEmails().contains(email.toLowerCase());
    }

    /** uid로 관리자 여부 판단 */
    public boolean isAdminUser(String uid) {
        if (uid == null) {
            return false;
        }
        return userRepository.findById(uid)
                .map(User::getEmail)
                .map(this::isAdminEmail)
                .orElse(false);
    }
}
