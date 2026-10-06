package com.studymate.studymate.controller;

import com.studymate.studymate.config.CurrentUser;
import com.studymate.studymate.dto.ProfileSummaryResponse;
import com.studymate.studymate.dto.UserStudiesResponse;
import com.studymate.studymate.entity.Study;
import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.StudyRepository;
import com.studymate.studymate.repository.UserRepository;
import com.studymate.studymate.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private StudyRepository studyRepository;

        @Autowired
        private AdminService adminService;

        @GetMapping("/{id}/info")
        public ResponseEntity<User> getUser(@PathVariable String id) {
                return userRepository.findById(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/{id}/profile")
        public ResponseEntity<ProfileSummaryResponse> getUserProfile(@PathVariable String id) {
                return userRepository.findById(id).map(user -> {
                        List<Study> allStudies = studyRepository.findAll();
                        long myStudyCount = allStudies.stream().filter(s -> id.equals(s.getCreatorId())).count();
                        long wishStudyCount = allStudies.stream().filter(s -> s.getWishlistedUserIds().contains(id))
                                        .count();
                        long applyStudyCount = allStudies.stream()
                                        .filter(s -> s.getParticipantIds().contains(id) && !id.equals(s.getCreatorId()))
                                        .count();

                        return ResponseEntity.ok(ProfileSummaryResponse.builder()
                                        .user(user)
                                        .myStudyCount(myStudyCount)
                                        .wishStudyCount(wishStudyCount)
                                        .applyStudyCount(myStudyCount + applyStudyCount)
                                        .admin(id.equals(CurrentUser.uid()) && adminService.isAdminUser(id))
                                        .build());
                }).orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/{id}/studies")
        public ResponseEntity<UserStudiesResponse> getUserStudies(@PathVariable String id) {
                List<Study> allStudies = studyRepository.findAll();

                return ResponseEntity.ok(UserStudiesResponse.builder()
                                .createdStudies(allStudies.stream()
                                                .filter(s -> id.equals(s.getCreatorId()))
                                                .collect(Collectors.toList()))
                                .joinedStudies(allStudies.stream()
                                                .filter(s -> s.getParticipantIds().contains(id))
                                                .collect(Collectors.toList()))
                                .wishlistedStudies(allStudies.stream()
                                                .filter(s -> s.getWishlistedUserIds().contains(id))
                                                .collect(Collectors.toList()))
                                .build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteUser(@PathVariable String id) {
                if (!id.equals(CurrentUser.uid())) {
                        return ResponseEntity.status(403).body("본인 계정만 탈퇴할 수 있습니다.");
                }
                List<Study> createdStudies = studyRepository.findAll().stream()
                                .filter(s -> id.equals(s.getCreatorId()))
                                .collect(Collectors.toList());
                studyRepository.deleteAll(createdStudies);
                userRepository.deleteById(id);
                return ResponseEntity.ok("탈퇴 완료");
        }

        @PutMapping("/{id}/profile")
        public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestBody User updatedUser) {
                if (!id.equals(CurrentUser.uid())) {
                        return ResponseEntity.status(403).body("본인 프로필만 수정할 수 있습니다.");
                }
                return userRepository.findById(id).<ResponseEntity<?>>map(user -> {
                        if (updatedUser.getName() != null)
                                user.setName(updatedUser.getName());
                        if (updatedUser.getDepartment() != null)
                                user.setDepartment(updatedUser.getDepartment());
                        if (updatedUser.getGrade() != null)
                                user.setGrade(updatedUser.getGrade());
                        if (updatedUser.getProfileImage() != null)
                                user.setProfileImage(updatedUser.getProfileImage());
                        return ResponseEntity.ok(userRepository.save(user));
                }).orElse(ResponseEntity.notFound().build());
        }
}