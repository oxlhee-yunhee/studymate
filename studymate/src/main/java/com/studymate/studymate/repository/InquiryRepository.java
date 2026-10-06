package com.studymate.studymate.repository;

import com.studymate.studymate.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
