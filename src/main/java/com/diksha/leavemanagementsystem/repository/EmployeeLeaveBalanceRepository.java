package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.EmployeeLeaveBalance;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeLeaveBalanceRepository extends JpaRepository<EmployeeLeaveBalance, Long> {

    List<EmployeeLeaveBalance> findByEmployeeId(Long employeeId);

    Optional<EmployeeLeaveBalance> findByEmployeeIdAndLeaveType(
            Long employeeId,
            LeaveType leaveType
    );

    boolean existsByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveType);

    /**
     * Every balance row for every employee of a company — used to compute
     * an aggregate per-employee total in a single query for list/dashboard
     * views, instead of one query per employee.
     */
    List<EmployeeLeaveBalance> findByEmployeeCompanyId(Long companyId);

    /**
     * Same data as {@link #findByEmployeeCompanyId(Long)} but with the
     * owning employee fetch-joined, ordered for report display. Used by
     * the balance report exporter so reading each row's employee name and
     * department does not trigger a separate query per row.
     */
    @Query("""
            SELECT b
            FROM EmployeeLeaveBalance b
            JOIN FETCH b.employee e
            WHERE e.company.id = :companyId
            ORDER BY e.fullName ASC, b.leaveType ASC
            """)
    List<EmployeeLeaveBalance> findByCompanyIdWithEmployee(@Param("companyId") Long companyId);

    /**
     * Whether any employee still holds a balance for this leave type —
     * used to block deleting a policy that is already in use.
     */
    boolean existsByEmployeeCompanyIdAndLeaveType(Long companyId, LeaveType leaveType);

    /**
     * Removes every employee's balance row for a leave type whose policy
     * has just been deleted. Only called once the caller has already
     * verified the policy is unused (no leave requests reference it).
     */
    void deleteByEmployeeCompanyIdAndLeaveType(Long companyId, LeaveType leaveType);
}
