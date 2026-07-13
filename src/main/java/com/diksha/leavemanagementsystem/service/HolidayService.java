package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.HolidayRequestDto;
import com.diksha.leavemanagementsystem.dto.response.HolidayResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Company-scoped holiday management.
 * <p>
 * Every holiday belongs to exactly one {@link Company}; managers can only
 * add, edit, delete, or view holidays for their own company, and employees
 * can only view holidays for their own company.
 */
public interface HolidayService {

    HolidayResponseDto addHoliday(HolidayRequestDto dto);

    HolidayResponseDto updateHoliday(Long id, HolidayRequestDto dto);

    void deleteHoliday(Long id);

    List<HolidayResponseDto> getCompanyHolidays();

    /**
     * Returns the set of holiday dates for the given company that fall
     * within [startDate, endDate], for use in leave-day calculations.
     */
    Set<LocalDate> getHolidayDatesInRange(Company company, LocalDate startDate, LocalDate endDate);
}
