package com.diksha.leavemanagementsystem.unit.util;

import com.diksha.leavemanagementsystem.util.DateUtils;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class DateUtilsUnitTest {

    // ─── calculateLeaveDays ───────────────────────────────────────────────────

    @Test
    void testCalculateLeaveDays_sameDateIsOneDay() {
        LocalDate date = LocalDate.of(2025, 1, 1);
        assertEquals(1, DateUtils.calculateLeaveDays(date, date));
    }

    @Test
    void testCalculateLeaveDays_consecutiveDatesIsTwo() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 2);
        assertEquals(2, DateUtils.calculateLeaveDays(start, end));
    }

    @Test
    void testCalculateLeaveDays_multipledays() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 6);
        assertEquals(6, DateUtils.calculateLeaveDays(start, end));
    }

    // ─── isPastDate ───────────────────────────────────────────────────────────

    @Test
    void testIsPastDate_pastDateReturnsTrue() {
        LocalDate past = LocalDate.now().minusDays(1);
        assertTrue(DateUtils.isPastDate(past));
    }

    @Test
    void testIsPastDate_todayReturnsFalse() {
        assertFalse(DateUtils.isPastDate(LocalDate.now()));
    }

    @Test
    void testIsPastDate_futureDateReturnsFalse() {
        LocalDate future = LocalDate.now().plusDays(5);
        assertFalse(DateUtils.isPastDate(future));
    }

    // ─── isFutureOrToday ─────────────────────────────────────────────────────

    @Test
    void testIsFutureOrToday_todayReturnsTrue() {
        assertTrue(DateUtils.isFutureOrToday(LocalDate.now()));
    }

    @Test
    void testIsFutureOrToday_futureDateReturnsTrue() {
        assertTrue(DateUtils.isFutureOrToday(LocalDate.now().plusDays(3)));
    }

    @Test
    void testIsFutureOrToday_pastDateReturnsFalse() {
        assertFalse(DateUtils.isFutureOrToday(LocalDate.now().minusDays(1)));
    }

    // ─── isDateInRange ────────────────────────────────────────────────────────

    @Test
    void testIsDateInRange_dateInsideRangeReturnsTrue() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 31);
        LocalDate middle = LocalDate.of(2025, 1, 15);
        assertTrue(DateUtils.isDateInRange(middle, start, end));
    }

    @Test
    void testIsDateInRange_dateOnStartBoundaryReturnsTrue() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 31);
        assertTrue(DateUtils.isDateInRange(start, start, end));
    }

    @Test
    void testIsDateInRange_dateOnEndBoundaryReturnsTrue() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 31);
        assertTrue(DateUtils.isDateInRange(end, start, end));
    }

    @Test
    void testIsDateInRange_dateOutsideRangeReturnsFalse() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 31);
        LocalDate outside = LocalDate.of(2025, 2, 1);
        assertFalse(DateUtils.isDateInRange(outside, start, end));
    }

    // ─── monthsBetween ────────────────────────────────────────────────────────

    @Test
    void testMonthsBetween_twoMonths() {
        LocalDate from = LocalDate.of(2025, 1, 1);
        LocalDate to = LocalDate.of(2025, 3, 1);
        assertEquals(2, DateUtils.monthsBetween(from, to));
    }

    @Test
    void testMonthsBetween_sameMonthIsZero() {
        LocalDate date = LocalDate.of(2025, 1, 1);
        assertEquals(0, DateUtils.monthsBetween(date, date));
    }
}
