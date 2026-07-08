package com.diksha.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamAvailabilityResponseDto {
    private Long employeeId;
    private String fullName;
    private String department;
    private String status; // Overall status: "AVAILABLE", "ON_LEAVE", "PENDING_LEAVE"
    private List<DailyStatusDto> dailyStatuses;
}
