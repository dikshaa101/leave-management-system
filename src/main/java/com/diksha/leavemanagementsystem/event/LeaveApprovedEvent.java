package com.diksha.leavemanagementsystem.event;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Published when a manager approves a leave request.
 * {@code recipientEmail} is the employee who applied for the leave.
 */
@Getter
@Builder
@ToString
public class LeaveApprovedEvent {

    private final String recipientEmail;
    private final String employeeName;
    private final String leaveType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final long totalDays;
    private final String remarks;
    private final LocalDate actionDate;
}
