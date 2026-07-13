package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.HolidayRequestDto;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.HolidayResponseDto;
import com.diksha.leavemanagementsystem.service.HolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    /**
     * Manager - Add Holiday
     */
    @PostMapping("/manager/holidays")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<HolidayResponseDto> addHoliday(
            @Valid @RequestBody HolidayRequestDto dto) {

        return new ApiResponse<>(
                true,
                "Holiday added successfully.",
                holidayService.addHoliday(dto)
        );
    }

    /**
     * Manager - Edit Holiday
     */
    @PutMapping("/manager/holidays/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<HolidayResponseDto> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequestDto dto) {

        return new ApiResponse<>(
                true,
                "Holiday updated successfully.",
                holidayService.updateHoliday(id, dto)
        );
    }

    /**
     * Manager - Delete Holiday
     */
    @DeleteMapping("/manager/holidays/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> deleteHoliday(@PathVariable Long id) {

        holidayService.deleteHoliday(id);

        return new ApiResponse<>(
                true,
                "Holiday deleted successfully.",
                null
        );
    }

    /**
     * Manager - View all company holidays
     */
    @GetMapping("/manager/holidays")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<HolidayResponseDto>> getManagerHolidays() {

        return new ApiResponse<>(
                true,
                "Holidays fetched successfully.",
                holidayService.getCompanyHolidays()
        );
    }

    /**
     * Employee - View company holidays (read-only)
     */
    @GetMapping("/employee/holidays")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<List<HolidayResponseDto>> getEmployeeHolidays() {

        return new ApiResponse<>(
                true,
                "Holidays fetched successfully.",
                holidayService.getCompanyHolidays()
        );
    }
}
