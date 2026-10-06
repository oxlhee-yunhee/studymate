package com.studymate.studymate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import com.studymate.studymate.entity.Study;
//import com.studymate.studymate.entity.User;
import com.studymate.studymate.repository.StudyRepository;
import com.studymate.studymate.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

//import java.util.ArrayList;
//import java.util.List;

@SpringBootApplication
public class StudymateApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudymateApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, StudyRepository studyRepository) {
        return args -> {/*
                         * if (studyRepository.count() > 0)
                         * return;
                         * User defaultUser = User.builder()
                         * .id("dbsgml0379")
                         * .name("박윤희")
                         * .email("h20235525@sch.ac.kr")
                         * .department("컴퓨터공학과")
                         * .grade(3)
                         * .profileImage("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde")
                         * .build();
                         * userRepository.save(defaultUser);
                         * 
                         * studyRepository.save(Study.builder()
                         * .title("자료구조 함께 공부해요!")
                         * .category("전공")
                         * .representativeImage(
                         * "https://images.unsplash.com/photo-1517842645767-c639042777db")
                         * .introduction(
                         * "자료구조를 탄탄하게 학습하고, 실전 문제풀이 실력을 길러요! 기초 개념부터 다양한 자료구조의 활용까지 함께 공부하고 매주 이론 학습과 문제풀이를 병행합니다."
                         * )
                         * .progressMethod("온라인 (Google Meet)")
                         * .schedule("2026.05.14 ~ 2026.06.20 (6주)")
                         * .timeInfo("19:00 - 21:00")
                         * .location("온라인 (Google Meet)")
                         * .maxParticipants(6)
                         * .currentParticipants(4)
                         * .status("모집중")
                         * .creatorId("admin")
                         * .tagList(new ArrayList<>(List.of("공부습관", "자료구조", "코딩")))
                         * .participantIds(new ArrayList<>(List.of("admin", "user4", "user5", "user6")))
                         * .wishlistedUserIds(new ArrayList<>(List.of("user123")))
                         * .build());
                         * 
                         * studyRepository.save(Study.builder()
                         * .title("영어 회화 스터디")
                         * .category("어학")
                         * .representativeImage(
                         * "https://images.unsplash.com/photo-1434030216411-0b793f4b4173")
                         * .introduction("실생활 영어 회화 연습, 함께 말해요! 부담 없이 일상 이야기를 영어로 소통하실 분 구합니다.")
                         * .progressMethod("오프라인")
                         * .schedule("2026.06.01 ~ 2026.08.01")
                         * .timeInfo("월/수 18:30 - 20:00")
                         * .location("인문대 스터디룸 3번")
                         * .maxParticipants(5)
                         * .currentParticipants(3)
                         * .status("모집중")
                         * .creatorId("user2")
                         * .tagList(new ArrayList<>(List.of("영어", "회화", "어학")))
                         * .participantIds(new ArrayList<>(List.of("user2", "user7", "user8")))
                         * .wishlistedUserIds(new ArrayList<>())
                         * .build());
                         * 
                         * studyRepository.save(Study.builder()
                         * .title("컴활 1급 필기 대비")
                         * .category("자격증")
                         * .representativeImage(
                         * "https://images.unsplash.com/photo-1516321318423-f06f85e504b3")
                         * .introduction("기술 분석 & 문제풀이 중심 스터디입니다. 빠르게 핵심 요약 및 기출 회독 돌릴 실전 멤버 구합니다.")
                         * .progressMethod("온오프라인 병행")
                         * .schedule("2026.06.10 ~ 2026.07.10")
                         * .timeInfo("토 10:00 - 12:00")
                         * .location("중앙도서관 4층")
                         * .maxParticipants(6)
                         * .currentParticipants(5)
                         * .status("모집중")
                         * .creatorId("user3")
                         * .tagList(new ArrayList<>(List.of("자격증", "컴활", "모의고사")))
                         * .participantIds(new ArrayList<>(List.of("user3", "user9", "user10", "user11",
                         * "user12")))
                         * .wishlistedUserIds(new ArrayList<>())
                         * .build());
                         */
        };
    }
}
