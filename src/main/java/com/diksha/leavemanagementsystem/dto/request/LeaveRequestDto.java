package com.diksha.leavemanagementsystem.dto.request;

import com.diksha.leavemanagementsystem.entity.LeaveType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;

    @NotNull
    private LeaveType leaveType;

}