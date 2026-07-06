package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.LeaveType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotBlank(message = "Reason is required")
    @Size(max=500)
    private String reason;

    @NotNull
    private LeaveType leaveType;

    private Long totalDays;

}