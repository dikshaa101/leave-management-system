package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @Size(min = 6, message = "Password should be at least 6 characters")
    private String password;

    private Role role;

}