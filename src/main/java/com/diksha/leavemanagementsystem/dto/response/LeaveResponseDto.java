package com.diksha.leavemanagementsystem.dto.response;

import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LeaveResponseDto {

    private Long id;

    private LocalDate startDate;

    private LocalDate endDate;

    private String reason;

    private LeaveType leaveType;

    private LeaveStatus status;

    private LocalDate appliedOn;

    private String employeeName;

    private Long totalDays;

}