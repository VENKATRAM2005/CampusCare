package com.campuscare.dto;

import com.campuscare.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;

    private String name;

    private Role role;

    private String department;

    private Integer year;

    private Boolean firstLogin;
}
