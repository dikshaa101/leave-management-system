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

    // Required for everyone
    @NotBlank
    private String companyCode;

    // Required only when registering a MANAGER
    private String companyName;

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String department;

    @NotBlank
    private String designation;


    private LocalDate joiningDate;

    private Role role;
}