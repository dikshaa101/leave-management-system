package com.diksha.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeRequestDto {

    @NotBlank
    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String department;

    @NotBlank
    private String designation;

    private LocalDate joiningDate;
}
