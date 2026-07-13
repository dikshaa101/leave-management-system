package com.diksha.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayRequestDto {

    @NotBlank(message = "Holiday name is required")
    @Size(max = 150, message = "Holiday name must not exceed 150 characters")
    private String holidayName;

    @NotNull(message = "Holiday date is required")
    @FutureOrPresent(message = "Holiday date cannot be in the past")
    private LocalDate holidayDate;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private boolean optionalHoliday;
}
