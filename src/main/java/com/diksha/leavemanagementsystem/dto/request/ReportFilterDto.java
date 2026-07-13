package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import lombok.Data;

import java.time.LocalDate;

/**
 * Optional filters accepted by every report export endpoint. Every field
 * is optional — an unset field means "no filter on this dimension".
 * Bound directly from request parameters (e.g. {@code ?employeeId=5&status=PENDING}).
 */
@Data
public class ReportFilterDto {

    private Long employeeId;

    private String department;

    private LeaveType leaveType;

    private LeaveStatus status;

    private LocalDate startDate;

    private LocalDate endDate;
}
