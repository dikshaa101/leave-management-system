package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.AvailabilityDto;
import com.diksha.leavemanagementsystem.service.TeamAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import com.diksha.leavemanagementsystem.dto.response.TeamAvailabilityResponseDto;
import java.util.List;

@RestController
@RequestMapping("/team")
@RequiredArgsConstructor
public class TeamController {

    private final TeamAvailabilityService teamAvailabilityService;

    // Today's availability
    @GetMapping("/availability/today")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<AvailabilityDto> getTodayAvailability() {

        return new ApiResponse<>(
                true,
                "Today's team availability fetched successfully.",
                teamAvailabilityService.getTodayAvailability()
        );
    }

    // Availability for a particular date
    @GetMapping("/availability/date")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<AvailabilityDto> getAvailabilityByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return new ApiResponse<>(
                true,
                "Team availability fetched successfully.",
                teamAvailabilityService.getAvailabilityByDate(date)
        );
    }

    @GetMapping("/availability/department")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<AvailabilityDto> getDepartmentAvailability(

            @RequestParam String department,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return new ApiResponse<>(
                true,
                "Department availability fetched successfully.",
                teamAvailabilityService.getDepartmentAvailability(
                        department,
                        date
                )
        );
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<TeamAvailabilityResponseDto>> getTeamAvailability(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            String department) {

        return new ApiResponse<>(
                true,
                "Team availability details fetched successfully.",
                teamAvailabilityService.getTeamAvailability(startDate, endDate, department)
        );
    }

}