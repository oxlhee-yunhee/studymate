package com.studymate.studymate.controller;

import com.studymate.studymate.config.CurrentUser;
import com.studymate.studymate.entity.Notification;
import com.studymate.studymate.entity.Study;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.NotificationRepository;
import com.studymate.studymate.repository.StudyRepository;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/studies")
public class StudyController {

    @Autowired
    private StudyRepository studyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatService chatService;

    private String nameOf(String userId) {
        return userRepository.findById(userId).map(User::getName).orElse(userId);
    }

    @PostMapping
    public ResponseEntity<Study> createStudy(@RequestBody Study study) {
        if (study.getParticipantIds() == null) {
            study.setParticipantIds(new ArrayList<>());
        }
        if (study.getTagList() == null) {
            study.setTagList(new ArrayList<>());
        }
        if (study.getWishlistedUserIds() == null) {
            study.setWishlistedUserIds(new ArrayList<>());
        }
        if (study.getCurrentParticipants() == null) {
            study.setCurrentParticipants(1);
        }
        if (study.getStatus() == null) {
            study.setStatus("모집중");
        }
        // 방장은 클라이언트가 보낸 값이 아니라 인증된 사용자로 강제한다.
        String creatorId = CurrentUser.uid();
        study.setCreatorId(creatorId);
        if (!study.getParticipantIds().contains(creatorId)) {
            study.getParticipantIds().add(creatorId);
        }
        Study savedStudy = studyRepository.save(study);

        // 스터디 생성과 동시에 단체 채팅방 개설 안내 메시지 기록
        chatService.sendSystemMessage(savedStudy.getId(),
                "'" + savedStudy.getTitle() + "' 스터디 채팅방이 개설되었습니다.");

        return new ResponseEntity<>(savedStudy, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Study>> getAllStudies(
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {

        List<Study> studies = studyRepository.findAll();

        if (category != null && !category.trim().isEmpty() && !category.equals("전체")) {
            studies = studies.stream()
                    .filter(s -> s.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();
            studies = studies.stream()
                    .filter(s -> s.getTitle().toLowerCase().contains(lowerKeyword) ||
                            s.getIntroduction().toLowerCase().contains(lowerKeyword) ||
                            s.getTagList().stream().anyMatch(t -> t.toLowerCase().contains(lowerKeyword)))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty() && !status.equals("전체")) {
            studies = studies.stream()
                    .filter(s -> s.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        if (sort != null) {
            if (sort.equals("최신순")) {
                studies = studies.stream()
                        .sorted(Comparator.comparing(Study::getId).reversed())
                        .collect(Collectors.toList());
            } else if (sort.equals("시간순")) {
                studies = studies.stream()
                        .sorted(Comparator.comparing(Study::getTimeInfo))
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(studies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Study> getStudyById(@PathVariable Long id) {
        return studyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyStudy(@PathVariable Long id) {
        final String userId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (study.getParticipantIds().contains(userId)) {
                return ResponseEntity.badRequest().body("이미 참여 중인 스터디입니다.");
            }
            if (study.getPendingUserIds().contains(userId)) {
                return ResponseEntity.badRequest().body("이미 신청한 스터디입니다.");
            }
            if ("마감".equals(study.getStatus())) {
                return ResponseEntity.badRequest().body("모집이 마감된 스터디입니다.");
            }
            if (userId.equals(study.getCreatorId())) {
                return ResponseEntity.badRequest().body("본인이 만든 스터디입니다.");
            }
            study.getPendingUserIds().add(userId);
            studyRepository.save(study);

            notificationRepository.save(Notification.builder()
                    .userId(study.getCreatorId())
                    .type("APPLY_RECEIVED")
                    .message("방장님! '" + study.getTitle() + "' 스터디 방에 " + nameOf(userId) + "님이 참여 신청을 하였습니다.")
                    .relatedStudyId(study.getId())
                    .build());

            return ResponseEntity.ok(study);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/wish")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long id) {
        final String userId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (study.getWishlistedUserIds().contains(userId)) {
                study.getWishlistedUserIds().remove(userId);
            } else {
                study.getWishlistedUserIds().add(userId);
            }
            studyRepository.save(study);
            return ResponseEntity.ok(study);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 승인
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id,
            @RequestParam String userId) {
        final String creatorId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (!creatorId.equals(study.getCreatorId())) {
                return ResponseEntity.status(403).body("방장만 승인할 수 있습니다.");
            }
            if (!study.getPendingUserIds().contains(userId)) {
                return ResponseEntity.badRequest().body("대기 중인 사용자가 아닙니다.");
            }
            study.getPendingUserIds().remove(userId);
            study.getParticipantIds().add(userId);
            study.setCurrentParticipants(study.getCurrentParticipants() + 1);
            if (study.getCurrentParticipants().equals(study.getMaxParticipants())) {
                study.setStatus("마감");
            }
            studyRepository.save(study);

            // 단체 채팅방 입장 알림 (시스템 메시지)
            chatService.sendSystemMessage(study.getId(), nameOf(userId) + "님이 채팅방에 입장했습니다.");

            notificationRepository.save(Notification.builder()
                    .userId(userId)
                    .type("APPLY_APPROVED")
                    .message(nameOf(userId) + "님! '" + study.getTitle() + "' 스터디 방에 참여하셨습니다! 스터디 방에서 다른 멤버들과 인사를 나눠보세요.")
                    .relatedStudyId(study.getId())
                    .build());

            return ResponseEntity.ok(study);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 거절
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id,
            @RequestParam String userId) {
        final String creatorId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (!creatorId.equals(study.getCreatorId())) {
                return ResponseEntity.status(403).body("방장만 거절할 수 있습니다.");
            }
            study.getPendingUserIds().remove(userId);
            studyRepository.save(study);
            return ResponseEntity.ok(study);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 강제 내보내기
    @PostMapping("/{id}/kick")
    public ResponseEntity<?> kickUser(@PathVariable Long id,
            @RequestParam String userId) {
        final String creatorId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (!creatorId.equals(study.getCreatorId())) {
                return ResponseEntity.status(403).body("방장만 내보낼 수 있습니다.");
            }
            study.getParticipantIds().remove(userId);
            study.setCurrentParticipants(study.getCurrentParticipants() - 1);
            if ("마감".equals(study.getStatus())) {
                study.setStatus("모집중");
            }
            studyRepository.save(study);

            // 채팅방 퇴장 처리
            chatService.sendSystemMessage(study.getId(), nameOf(userId) + "님이 채팅방에서 나갔습니다.");
            chatService.removeMemberReadStatus(study.getId(), userId);

            return ResponseEntity.ok(study);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 추천
    @GetMapping("/categories/stats")
    public ResponseEntity<?> getCategoryStats() {
        List<Study> studies = studyRepository.findAll();
        Map<String, Long> stats = studies.stream()
                .collect(Collectors.groupingBy(Study::getCategory, Collectors.counting()));
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudy(@PathVariable Long id) {
        final String creatorId = CurrentUser.uid();
        return studyRepository.findById(id).map(study -> {
            if (!creatorId.equals(study.getCreatorId())) {
                return ResponseEntity.status(403).body("방장만 삭제할 수 있습니다.");
            }
            chatService.deleteRoomData(study.getId());
            studyRepository.delete(study);
            return ResponseEntity.ok("삭제 완료");
        }).orElse(ResponseEntity.notFound().build());
    }

}