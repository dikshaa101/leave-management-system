package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.dto.request.LeavePolicyRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeavePolicyResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.LeavePolicy;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.LeavePolicyRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import com.diksha.leavemanagementsystem.service.LeavePolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Default {@link LeavePolicyService} implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LeavePolicyServiceImpl implements LeavePolicyService {

    private final LeavePolicyRepository leavePolicyRepository;
    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;

    /**
     * Returns the logged-in user's company.
     */
    private Company getLoggedInCompany() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return user.getCompany();
    }

    @Override
    @Transactional
    public LeavePolicyResponseDto createPolicy(LeavePolicyRequestDto dto) {

        Company company = getLoggedInCompany();

        if (leavePolicyRepository.existsByCompanyIdAndLeaveType(
                company.getId(), dto.getLeaveType())) {
            throw new BadRequestException(
                    "A " + dto.getLeaveType() + " leave policy already exists for your company.");
        }

        LeavePolicy policy = LeavePolicy.builder()
                .company(company)
                .leaveType(dto.getLeaveType())
                .totalLeaves(dto.getTotalLeaves())
                .description(dto.getDescription())
                .active(true)
                .build();

        LeavePolicy saved = leavePolicyRepository.save(policy);

        // Backfill balances for every existing employee of the company.
        employeeLeaveBalanceService.ensureBalanceForCompany(company, saved);

        log.info("Leave policy {} ({} days) created for company id {}",
                saved.getLeaveType(), saved.getTotalLeaves(), company.getId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public LeavePolicyResponseDto updatePolicy(Long id, LeavePolicyRequestDto dto) {

        Company company = getLoggedInCompany();

        LeavePolicy policy = leavePolicyRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave policy not found"));

        if (policy.getLeaveType() != dto.getLeaveType()) {
            throw new BadRequestException(
                    "Leave type cannot be changed once a policy is created. "
                            + "Delete this policy and create a new one instead.");
        }

        policy.setTotalLeaves(dto.getTotalLeaves());
        policy.setDescription(dto.getDescription());

        LeavePolicy saved = leavePolicyRepository.save(policy);

        log.info("Leave policy id {} updated for company id {}", id, company.getId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public LeavePolicyResponseDto updateStatus(Long id, boolean active) {

        Company company = getLoggedInCompany();

        LeavePolicy policy = leavePolicyRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave policy not found"));

        boolean wasInactive = !policy.isActive();

        policy.setActive(active);

        LeavePolicy saved = leavePolicyRepository.save(policy);

        if (active && wasInactive) {
            // Reactivating: backfill any employees added while it was off.
            employeeLeaveBalanceService.ensureBalanceForCompany(company, saved);
        }

        log.info("Leave policy id {} set to active={} for company id {}",
                id, active, company.getId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {

        Company company = getLoggedInCompany();

        LeavePolicy policy = leavePolicyRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave policy not found"));

        boolean inUse = leaveRepository.existsByEmployeeCompanyIdAndLeaveType(
                company.getId(), policy.getLeaveType());

        if (inUse) {
            throw new BadRequestException(
                    "Cannot delete a leave policy that has already been used in a leave request.");
        }

        employeeLeaveBalanceService.removeBalancesForPolicy(company, policy.getLeaveType());

        leavePolicyRepository.delete(policy);

        log.info("Leave policy id {} deleted for company id {}", id, company.getId());
    }

    @Override
    public List<LeavePolicyResponseDto> getCompanyPolicies() {

        Company company = getLoggedInCompany();

        return leavePolicyRepository
                .findByCompanyIdOrderByLeaveTypeAsc(company.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<LeavePolicyResponseDto> getActiveCompanyPolicies() {

        Company company = getLoggedInCompany();

        return leavePolicyRepository
                .findByCompanyIdAndActiveTrueOrderByLeaveTypeAsc(company.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private LeavePolicyResponseDto mapToDto(LeavePolicy policy) {
        return LeavePolicyResponseDto.builder()
                .id(policy.getId())
                .leaveType(policy.getLeaveType())
                .totalLeaves(policy.getTotalLeaves())
                .description(policy.getDescription())
                .active(policy.isActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
