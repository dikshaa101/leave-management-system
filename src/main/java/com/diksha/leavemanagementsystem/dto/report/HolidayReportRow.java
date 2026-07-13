package com.diksha.leavemanagementsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * A single flattened row of a company holiday-list report.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HolidayReportRow {

    private String holidayName;

    private LocalDate holidayDate;

    private String description;

    private boolean optionalHoliday;
}
