package com.diksha.leavemanagementsystem.dto.response;

import com.diksha.leavemanagementsystem.entity.LeaveType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeavePolicyResponseDto {

    private Long id;

    private LeaveType leaveType;

    private Integer totalLeaves;

    private String description;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
