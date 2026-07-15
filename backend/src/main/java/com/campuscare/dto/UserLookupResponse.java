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
public class UserLookupResponse {

    private String name;

    private String department;

    private Integer year;

    private Role role;
}
