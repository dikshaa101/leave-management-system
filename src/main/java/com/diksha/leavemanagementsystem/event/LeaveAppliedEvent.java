package com.diksha.leavemanagementsystem.event;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Published once per manager when an employee applies for leave.
 * {@code recipientEmail} is the manager's email who should be notified.
 */
@Getter
@Builder
@ToString
public class LeaveAppliedEvent {

    private final String recipientEmail;
    private final String managerName;
    private final String employeeName;
    private final String leaveType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final long totalDays;
    private final String reason;
    private final LocalDate appliedOn;
}
