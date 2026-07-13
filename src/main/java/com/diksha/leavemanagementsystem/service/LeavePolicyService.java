package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LeavePolicyRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeavePolicyResponseDto;

import java.util.List;

/**
 * Company-scoped leave policy management.
 * <p>
 * A leave policy defines how many days of a given {@link com.diksha.leavemanagementsystem.entity.LeaveType}
 * a company grants its employees. Only managers of a company can manage
 * that company's policies; employees may only view active ones.
 * <p>
 * Note: updating {@code totalLeaves} on an existing policy only changes
 * the template going forward — it does not retroactively adjust balances
 * already provisioned to employees. New/backfilled balances always use
 * the latest {@code totalLeaves} at the time they are provisioned.
 */
public interface LeavePolicyService {

    LeavePolicyResponseDto createPolicy(LeavePolicyRequestDto dto);

    LeavePolicyResponseDto updatePolicy(Long id, LeavePolicyRequestDto dto);

    LeavePolicyResponseDto updateStatus(Long id, boolean active);

    void deletePolicy(Long id);

    /**
     * All policies (active and inactive) of the logged-in manager's
     * company.
     */
    List<LeavePolicyResponseDto> getCompanyPolicies();

    /**
     * Only active policies of the logged-in user's company — what
     * employees are allowed to see and apply leave against.
     */
    List<LeavePolicyResponseDto> getActiveCompanyPolicies();
}
