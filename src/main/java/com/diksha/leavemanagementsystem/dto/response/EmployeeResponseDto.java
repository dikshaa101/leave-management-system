package com.diksha.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

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

    /**
     * Remaining balance per leave type, driven by the employee's company
     * leave policies. Replaces the old single {@code leaveBalance} field.
     */
    private List<EmployeeLeaveBalanceResponseDto> leaveBalances;

}
