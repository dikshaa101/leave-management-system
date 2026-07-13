package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    /**
     * All holidays belonging to a company, ordered chronologically.
     */
    List<Holiday> findByCompanyIdOrderByHolidayDateAsc(Long companyId);

    /**
     * Fetch a single holiday only if it belongs to the given company —
     * enforces manager/company isolation on edit and delete.
     */
    Optional<Holiday> findByIdAndCompanyId(Long id, Long companyId);

    /**
     * Used to prevent duplicate holiday dates within the same company.
     */
    boolean existsByCompanyIdAndHolidayDate(Long companyId, LocalDate holidayDate);

    /**
     * Same as above, excluding the holiday currently being edited.
     */
    boolean existsByCompanyIdAndHolidayDateAndIdNot(
            Long companyId,
            LocalDate holidayDate,
            Long id
    );

    /**
     * All holiday dates of a company falling within a leave request's
     * date range — used to exclude holidays from leave-day calculations.
     */
    List<Holiday> findByCompanyIdAndHolidayDateBetween(
            Long companyId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Holiday> findByCompany(Company company);
}
