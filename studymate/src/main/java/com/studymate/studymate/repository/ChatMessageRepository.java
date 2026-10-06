package com.studymate.studymate.repository;

import com.studymate.studymate.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByStudyIdOrderByCreatedAtAsc(Long studyId);

    Optional<ChatMessage> findTopByStudyIdOrderByCreatedAtDesc(Long studyId);

    long countByStudyIdAndCreatedAtAfter(Long studyId, LocalDateTime after);

    long countByStudyId(Long studyId);

    void deleteByStudyId(Long studyId);
}
