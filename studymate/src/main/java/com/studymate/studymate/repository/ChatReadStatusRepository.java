package com.studymate.studymate.repository;

import com.studymate.studymate.entity.ChatReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatReadStatusRepository extends JpaRepository<ChatReadStatus, Long> {

    Optional<ChatReadStatus> findByStudyIdAndUserId(Long studyId, String userId);

    void deleteByStudyId(Long studyId);

    void deleteByStudyIdAndUserId(Long studyId, String userId);
}
