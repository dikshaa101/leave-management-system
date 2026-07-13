package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.EmployeeLeaveBalance;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

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
