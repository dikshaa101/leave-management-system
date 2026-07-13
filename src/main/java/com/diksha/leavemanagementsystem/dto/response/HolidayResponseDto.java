package com.diksha.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class HolidayResponseDto {

    private Long id;

    private String holidayName;

    private LocalDate holidayDate;

    private String description;

    private boolean optionalHoliday;

    private LocalDateTime createdAt;
}
