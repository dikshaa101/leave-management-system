package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.dto.response.EmployeeLeaveBalanceResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.EmployeeLeaveBalance;
import com.diksha.leavemanagementsystem.entity.LeavePolicy;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeLeaveBalanceRepository;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeavePolicyRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Default {@link EmployeeLeaveBalanceService} implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeLeaveBalanceServiceImpl implements EmployeeLeaveBalanceService {

    private final EmployeeLeaveBalanceRepository balanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeavePolicyRepository leavePolicyRepository;
    private final UserRepository userRepository;

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));
    }

    @Override
    @Transactional
    public void ensureBalancesForEmployee(Employee employee) {

        if (employee.getCompany() == null) {
            return;
        }

        List<LeavePolicy> activePolicies = leavePolicyRepository
                .findByCompanyIdAndActiveTrueOrderByLeaveTypeAsc(employee.getCompany().getId());

        for (LeavePolicy policy : activePolicies) {
            createBalanceIfMissing(employee, policy);
        }
    }

    @Override
    @Transactional
    public void ensureBalanceForCompany(Company company, LeavePolicy policy) {

        List<Employee> employees = employeeRepository.findByCompanyId(company.getId());

        for (Employee employee : employees) {
            createBalanceIfMissing(employee, policy);
        }
    }

    private void createBalanceIfMissing(Employee employee, LeavePolicy policy) {

        if (balanceRepository.existsByEmployeeIdAndLeaveType(
                employee.getId(), policy.getLeaveType())) {
            return;
        }

        EmployeeLeaveBalance balance = EmployeeLeaveBalance.builder()
                .employee(employee)
                .leaveType(policy.getLeaveType())
                .totalAllocated(policy.getTotalLeaves())
                .remainingBalance(policy.getTotalLeaves())
                .build();

        balanceRepository.save(balance);

        log.info("Provisioned {} balance of {} days for employee id {}",
                policy.getLeaveType(), policy.getTotalLeaves(), employee.getId());
    }

    @Override
    public List<EmployeeLeaveBalanceResponseDto> getMyBalances() {

        Employee employee = getLoggedInEmployee();

        return getBalancesForEmployee(employee);
    }

    @Override
    public List<EmployeeLeaveBalanceResponseDto> getBalancesForEmployee(Employee employee) {

        ensureBalancesForEmployee(employee);

        return balanceRepository.findByEmployeeId(employee.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public void removeBalancesForPolicy(Company company, LeaveType leaveType) {

        balanceRepository.deleteByEmployeeCompanyIdAndLeaveType(company.getId(), leaveType);

        log.info("Removed balances of type {} for company id {} after policy deletion",
                leaveType, company.getId());
    }

    @Override
    public Map<Long, Integer> getTotalRemainingBalanceByEmployee(Long companyId) {

        List<EmployeeLeaveBalance> balances =
                balanceRepository.findByEmployeeCompanyId(companyId);

        Map<Long, Integer> totals = new HashMap<>();

        for (EmployeeLeaveBalance balance : balances) {
            Long employeeId = balance.getEmployee().getId();
            totals.merge(employeeId, balance.getRemainingBalance(), Integer::sum);
        }

        return totals;
    }

    @Override
    public void assertSufficientBalance(Employee employee, LeaveType leaveType, long days) {

        EmployeeLeaveBalance balance = balanceRepository
                .findByEmployeeIdAndLeaveType(employee.getId(), leaveType)
                .orElseThrow(() -> new BadRequestException(
                        "No " + leaveType + " leave balance found for this employee."));

        if (balance.getRemainingBalance() < days) {
            throw new BadRequestException(
                    "Insufficient " + leaveType + " leave balance. Available: "
                            + balance.getRemainingBalance() + " days, requested: " + days + " days.");
        }
    }

    @Override
    @Transactional
    public void deductBalance(Employee employee, LeaveType leaveType, long days) {

        EmployeeLeaveBalance balance = balanceRepository
                .findByEmployeeIdAndLeaveType(employee.getId(), leaveType)
                .orElseThrow(() -> new BadRequestException(
                        "No " + leaveType + " leave balance found for this employee."));

        if (balance.getRemainingBalance() < days) {
            throw new BadRequestException(
                    "Insufficient " + leaveType + " leave balance. Available: "
                            + balance.getRemainingBalance() + " days, requested: " + days + " days.");
        }

        balance.setRemainingBalance((int) (balance.getRemainingBalance() - days));

        balanceRepository.save(balance);

        log.info("Deducted {} {} day(s) from employee id {} (remaining: {})",
                days, leaveType, employee.getId(), balance.getRemainingBalance());
    }

    @Override
    @Transactional
    public void restoreBalance(Employee employee, LeaveType leaveType, long days) {

        EmployeeLeaveBalance balance = balanceRepository
                .findByEmployeeIdAndLeaveType(employee.getId(), leaveType)
                .orElseThrow(() -> new BadRequestException(
                        "No " + leaveType + " leave balance found for this employee."));

        balance.setRemainingBalance((int) (balance.getRemainingBalance() + days));

        balanceRepository.save(balance);

        log.info("Restored {} {} day(s) to employee id {} (remaining: {})",
                days, leaveType, employee.getId(), balance.getRemainingBalance());
    }

    private EmployeeLeaveBalanceResponseDto mapToDto(EmployeeLeaveBalance balance) {

        int used = balance.getTotalAllocated() - balance.getRemainingBalance();

        return EmployeeLeaveBalanceResponseDto.builder()
                .leaveType(balance.getLeaveType())
                .totalAllocated(balance.getTotalAllocated())
                .remainingBalance(balance.getRemainingBalance())
                .usedLeaves(used)
                .build();
    }
}
