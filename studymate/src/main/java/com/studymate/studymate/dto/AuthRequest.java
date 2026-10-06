package com.studymate.studymate.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String idToken;
    private String email;
    private String name;
    private String department;
    private Integer grade;
    private String profileImage;
}