package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private Role role;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    private String phone;

    private String department;

    private String designation;

    private LocalDate joiningDate;

}