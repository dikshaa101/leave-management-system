package com.diksha.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponseDto {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String department;

    private String designation;

    private LocalDate joiningDate;

    private Integer leaveBalance;

}
