package com.studymate.studymate.service;

import com.studymate.studymate.entity.Inquiry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AdminService adminService;

    public void sendInquiryReceivedMail(Inquiry inquiry, String submitterEmail) {
        List<String> recipients = adminService.adminEmails();
        if (recipients.isEmpty()) {
            System.err.println("관리자 이메일(app.admin-emails)이 설정되지 않아 문의 메일을 보내지 않았습니다.");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipients.toArray(new String[0]));
        message.setSubject("[StudyMate 문의] " + inquiry.getTitle());
        message.setText(
                "문의자: " + submitterEmail + "\n\n" + inquiry.getContent());
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("문의 이메일 발송 실패: " + e.getMessage());
        }
    }
}
