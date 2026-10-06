package com.studymate.studymate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "studies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Study {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    @Column(columnDefinition = "TEXT")
    private String representativeImage;

    @Column(length = 2000)
    private String introduction;

    private String progressMethod;
    private String schedule;
    private String timeInfo;
    private String location;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String status; // 모집중, 마감
    private String creatorId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "study_tags", joinColumns = @JoinColumn(name = "study_id"))
    @Builder.Default
    private List<String> tagList = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "study_participants", joinColumns = @JoinColumn(name = "study_id"))
    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "study_wishlist", joinColumns = @JoinColumn(name = "study_id"))
    @Builder.Default
    private List<String> wishlistedUserIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "study_pending", joinColumns = @JoinColumn(name = "study_id"))
    @Builder.Default
    private List<String> pendingUserIds = new ArrayList<>(); // 승인 대기자

    @Column(length = 1000)
    private String joinCondition;
}