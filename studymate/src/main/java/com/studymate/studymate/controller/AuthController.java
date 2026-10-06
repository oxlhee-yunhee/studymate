package com.studymate.studymate.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.studymate.studymate.dto.AuthRequest;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminService adminService;

    /**
     * Firebase ID 토큰을 검증하고 사용자 레코드를 만들거나 조회한다.
     *
     * 토큰이 유효하지 않으면 절대로 클라이언트가 보낸 값을 신뢰하지 않는다.
     * (예전 구현은 검증 실패 시 idToken 문자열을 그대로 uid로 사용해 누구나 임의의
     *  사용자로 로그인할 수 있었다.)
     */
    @PostMapping("/sso")
    public ResponseEntity<?> verifySSOToken(@RequestBody AuthRequest request) {

        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            return ResponseEntity.status(401).body("인증 토큰이 없습니다.");
        }

        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
        } catch (Exception e) {
            log.warn("Firebase 토큰 검증 실패: {}", e.getMessage());
            return ResponseEntity.status(401).body("유효하지 않은 인증 토큰입니다.");
        }

        if (!decodedToken.isEmailVerified()) {
            return ResponseEntity.status(403).body("이메일 인증을 완료한 뒤 로그인해 주세요.");
        }

        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();

        // 학교 도메인 계정이거나, 등록된 관리자 이메일이어야 한다.
        if (!adminService.isLoginAllowed(email)) {
            return ResponseEntity.status(403)
                    .body("학교 이메일(" + adminService.allowedEmailDomain() + ")로만 이용할 수 있습니다.");
        }

        Optional<User> existingUser = userRepository.findById(uid);
        if (existingUser.isPresent()) {
            return ResponseEntity.ok(existingUser.get());
        }

        // 신규 가입: 신원(uid/email)은 토큰에서만 가져오고, 프로필 항목만 요청 값을 쓴다.
        String name = decodedToken.getName();
        if (name == null || name.isBlank()) {
            name = (request.getName() != null && !request.getName().isBlank()) ? request.getName() : "신규회원";
        }

        User newUser = User.builder()
                .id(uid)
                .email(email)
                .name(name)
                .department(request.getDepartment() != null ? request.getDepartment() : "컴퓨터공학과")
                .grade(request.getGrade() != null ? request.getGrade() : 1)
                .profileImage(request.getProfileImage() != null
                        ? request.getProfileImage()
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde")
                .build();

        return ResponseEntity.ok(userRepository.save(newUser));
    }
}
