package com.studymate.studymate.controller;

import com.studymate.studymate.config.CurrentUser;
import com.studymate.studymate.entity.Inquiry;
import com.studymate.studymate.entity.Notification;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.InquiryRepository;
import com.studymate.studymate.repository.NotificationRepository;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.AdminService;
import com.studymate.studymate.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private AdminService adminService;

    private boolean isAdmin(String requesterId) {
        return adminService.isAdminUser(requesterId);
    }

    @PostMapping
    public ResponseEntity<Inquiry> submitInquiry(@RequestBody Map<String, String> body) {
        String userId = CurrentUser.uid();
        String title = body.get("title");
        String content = body.get("content");

        Inquiry inquiry = Inquiry.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .build();
        Inquiry saved = inquiryRepository.save(inquiry);

        notificationRepository.save(Notification.builder()
                .userId(userId)
                .type("INQUIRY_RECEIVED")
                .message("문의하신 '" + title + "' 내용이 정상적으로 접수되었습니다.")
                .relatedInquiryId(saved.getId())
                .build());

        String submitterEmail = userRepository.findById(userId).map(User::getEmail).orElse(userId);
        mailService.sendInquiryReceivedMail(saved, submitterEmail);

        return ResponseEntity.ok(saved);
    }

    // 관리자 전용 문의 목록 조회
    @GetMapping
    public ResponseEntity<?> getAllInquiries() {
        String requesterId = CurrentUser.uid();
        if (!isAdmin(requesterId)) {
            return ResponseEntity.status(403).body("접근 권한이 없습니다.");
        }
        return ResponseEntity.ok(inquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    // 관리자 답변 등록
    @PostMapping("/{id}/answer")
    public ResponseEntity<?> answerInquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String requesterId = CurrentUser.uid();
        String answer = body.get("answer");
        if (!isAdmin(requesterId)) {
            return ResponseEntity.status(403).body("접근 권한이 없습니다.");
        }

        return inquiryRepository.findById(id).map(inquiry -> {
            inquiry.setAnswer(answer);
            inquiry.setStatus("답변완료");
            inquiry.setAnsweredAt(LocalDateTime.now());
            Inquiry saved = inquiryRepository.save(inquiry);

            notificationRepository.save(Notification.builder()
                    .userId(inquiry.getUserId())
                    .type("INQUIRY_ANSWERED")
                    .message("문의하신 '" + inquiry.getTitle() + "'에 대한 답변이 완료되었습니다: " + answer)
                    .relatedInquiryId(saved.getId())
                    .build());

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
