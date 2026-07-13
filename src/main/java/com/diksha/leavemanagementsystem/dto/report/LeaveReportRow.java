package com.diksha.leavemanagementsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * A single flattened row of a leave-requests report — decoupled from the
 * {@code LeaveRequest} entity so exporters never touch lazy associations.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaveReportRow {

    private String employeeName;

    private String department;

    private String leaveType;

    private String status;

    private LocalDate startDate;

    private LocalDate endDate;

    private long totalDays;

    private String reason;

    private LocalDate appliedOn;

    private String managerRemarks;
}
