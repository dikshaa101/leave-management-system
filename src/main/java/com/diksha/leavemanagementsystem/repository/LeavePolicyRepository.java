package com.diksha.leavemanagementsystem.repository;

import com.diksha.leavemanagementsystem.entity.LeavePolicy;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, Long> {

    /**
     * All policies of a company (active + inactive) — used by managers.
     */
    List<LeavePolicy> findByCompanyIdOrderByLeaveTypeAsc(Long companyId);

    /**
     * Only active policies of a company — used by employees, and to
     * validate/provision balances.
     */
    List<LeavePolicy> findByCompanyIdAndActiveTrueOrderByLeaveTypeAsc(Long companyId);

    Optional<LeavePolicy> findByIdAndCompanyId(Long id, Long companyId);

    Optional<LeavePolicy> findByCompanyIdAndLeaveTypeAndActiveTrue(
            Long companyId,
            LeaveType leaveType
    );

    boolean existsByCompanyIdAndLeaveType(Long companyId, LeaveType leaveType);

    boolean existsByCompanyIdAndLeaveTypeAndIdNot(
            Long companyId,
            LeaveType leaveType,
            Long id
    );
}
