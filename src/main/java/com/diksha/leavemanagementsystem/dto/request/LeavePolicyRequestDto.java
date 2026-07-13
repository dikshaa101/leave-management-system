package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.LeaveType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeavePolicyRequestDto {

    @NotNull(message = "Leave type is required")
    private LeaveType leaveType;

    @NotNull(message = "Total leaves is required")
    @Min(value = 0, message = "Total leaves cannot be negative")
    private Integer totalLeaves;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
