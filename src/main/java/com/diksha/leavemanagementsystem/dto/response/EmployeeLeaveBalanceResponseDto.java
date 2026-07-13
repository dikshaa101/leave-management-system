package com.diksha.leavemanagementsystem.dto.response;

import com.diksha.leavemanagementsystem.entity.LeaveType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeLeaveBalanceResponseDto {

    private LeaveType leaveType;

    private Integer totalAllocated;

    private Integer remainingBalance;

    private Integer usedLeaves;
}
