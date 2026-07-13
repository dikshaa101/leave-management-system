package com.diksha.leavemanagementsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single flattened row of an employee leave-balance report — one row
 * per (employee, leave type) balance.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeBalanceReportRow {

    private String employeeName;

    private String department;

    private String leaveType;

    private int totalAllocated;

    private int remainingBalance;

    private int usedLeaves;
}
