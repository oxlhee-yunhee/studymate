package com.studymate.studymate.dto;

import com.studymate.studymate.entity.Study;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStudiesResponse {
    private List<Study> createdStudies;
    private List<Study> joinedStudies;
    private List<Study> wishlistedStudies;
}