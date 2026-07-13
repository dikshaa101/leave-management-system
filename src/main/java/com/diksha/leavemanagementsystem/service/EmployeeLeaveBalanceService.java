package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.response.EmployeeLeaveBalanceResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeavePolicy;
import com.diksha.leavemanagementsystem.entity.LeaveType;

import java.util.List;
import java.util.Map;

/**
 * Manages each employee's per-leave-type balance.
 * <p>
 * A balance row is provisioned lazily ("self-healing"): the first time an
 * employee's balances are read, or a new {@code LeavePolicy} is created for
 * their company, any missing balance rows are created from the active
 * policy's {@code totalLeaves}. This means employees created before any
 * policy existed, or before a particular leave type was introduced, are
 * transparently backfilled without a manual migration step.
 */
public interface EmployeeLeaveBalanceService {

    /**
     * Ensures the given employee has a balance row for every active policy
     * of their company, creating any missing ones. Safe to call repeatedly.
     */
    void ensureBalancesForEmployee(Employee employee);

    /**
     * Ensures every employee of the given company has a balance row for the
     * given (newly created or reactivated) policy. Used to backfill
     * existing employees when a manager adds a policy after employees
     * already exist.
     */
    void ensureBalanceForCompany(Company company, LeavePolicy policy);

    List<EmployeeLeaveBalanceResponseDto> getMyBalances();

    /**
     * Same as {@link #getMyBalances()} but for an arbitrary employee —
     * used by manager-facing views (employee list/detail) where the
     * viewer is not the employee themselves. Ensures balance rows exist
     * first, so a manager always sees complete data even for employees
     * created before a particular policy existed.
     */
    List<EmployeeLeaveBalanceResponseDto> getBalancesForEmployee(Employee employee);

    /**
     * Removes every employee's balance row of the given leave type for a
     * company — called after a leave policy of that type is deleted, so
     * no orphaned balances linger once the backing policy no longer
     * exists. Safe to call even if no such rows exist.
     */
    void removeBalancesForPolicy(Company company, LeaveType leaveType);

    /**
     * Aggregate remaining balance (summed across all leave types) per
     * employee id, for an entire company — computed in a single query for
     * use in manager list/dashboard views.
     */
    Map<Long, Integer> getTotalRemainingBalanceByEmployee(Long companyId);

    /**
     * Throws {@link com.diksha.leavemanagementsystem.exception.BadRequestException}
     * if the employee does not have enough remaining balance of the given
     * leave type to cover the requested number of days.
     */
    void assertSufficientBalance(Employee employee, LeaveType leaveType, long days);

    /**
     * Deducts the given number of days from the employee's balance of the
     * given leave type. Assumes {@link #assertSufficientBalance} has
     * already been checked.
     */
    void deductBalance(Employee employee, LeaveType leaveType, long days);

    /**
     * Restores (adds back) the given number of days to the employee's
     * balance of the given leave type — used when a previously approved
     * leave is cancelled.
     */
    void restoreBalance(Employee employee, LeaveType leaveType, long days);
}
