package com.diksha.leavemanagementsystem.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

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
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
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
