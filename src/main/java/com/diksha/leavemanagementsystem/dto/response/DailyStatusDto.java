package com.diksha.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatusDto {
    private LocalDate date;
    private String status; // "AVAILABLE", "ON_LEAVE", "PENDING_LEAVE"
}
