package com.studymate.studymate.dto;

import com.studymate.studymate.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileSummaryResponse {
    private User user;
    private long myStudyCount;
    private long wishStudyCount;
    private long applyStudyCount;
    /** 본인 프로필 조회 시에만 채워지는 관리자 여부 (프론트 하드코딩 제거용) */
    private boolean admin;
}