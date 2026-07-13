package com.diksha.leavemanagementsystem.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

/**
 * Utility class for common date operations used across the application.
 */
public class DateUtils {

    private DateUtils() {
        // Utility class – no instantiation
    }

    /**
     * Calculates the number of leave days inclusive of both start and end date.
     */
    public static long calculateLeaveDays(LocalDate startDate, LocalDate endDate) {
        return calculateLeaveDays(startDate, endDate, Collections.emptySet());
    }

    /**
     * Calculates the number of leave days inclusive of both start and end
     * date, excluding any dates that fall on a company holiday.
     * <p>
     * Example: 22-26 Dec spans 5 calendar days. If 25 Dec is a holiday,
     * this returns 4.
     *
     * @param startDate    leave start date (inclusive)
     * @param endDate      leave end date (inclusive)
     * @param holidayDates the set of holiday dates to exclude from the count
     */
    public static long calculateLeaveDays(
            LocalDate startDate,
            LocalDate endDate,
            Collection<LocalDate> holidayDates) {

        Set<LocalDate> holidays = holidayDates == null
                ? Collections.emptySet()
                : Set.copyOf(holidayDates);

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        long holidaysWithinRange = holidays.stream()
                .filter(date -> isDateInRange(date, startDate, endDate))
                .count();

        return totalDays - holidaysWithinRange;
    }

    /**
     * Returns true if the given date is before today.
     */
    public static boolean isPastDate(LocalDate date) {
        return date.isBefore(LocalDate.now());
    }

    /**
     * Returns true if the given date is today or in the future.
     */
    public static boolean isFutureOrToday(LocalDate date) {
        return !date.isBefore(LocalDate.now());
    }

    /**
     * Returns true if the given date falls within the range [start, end] (inclusive).
     */
    public static boolean isDateInRange(LocalDate date, LocalDate start, LocalDate end) {
        return !date.isBefore(start) && !date.isAfter(end);
    }

    /**
     * Returns the number of whole months between two dates.
     */
    public static long monthsBetween(LocalDate from, LocalDate to) {
        return ChronoUnit.MONTHS.between(from, to);
    }
}
