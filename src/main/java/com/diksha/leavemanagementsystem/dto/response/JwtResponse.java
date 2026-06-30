package com.diksha.leavemanagementsystem.dto.response;

import com.diksha.leavemanagementsystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {

    private String token;
    private String username;
    private Role role;

}