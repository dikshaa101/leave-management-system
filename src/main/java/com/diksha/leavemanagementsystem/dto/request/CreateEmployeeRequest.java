package com.diksha.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email")
    private String email;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Phone number must be 10 digits"
    )
    private String phone;

    @NotBlank
    private String department;

    @NotBlank
    private String designation;

    @PastOrPresent
    private LocalDate joiningDate;
}