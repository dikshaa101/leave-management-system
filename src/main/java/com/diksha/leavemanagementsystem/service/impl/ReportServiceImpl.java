package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.dto.report.EmployeeBalanceReportRow;
import com.diksha.leavemanagementsystem.dto.report.HolidayReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeavePolicyReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeaveReportRow;
import com.diksha.leavemanagementsystem.dto.request.ReportFilterDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.EmployeeLeaveBalance;
import com.diksha.leavemanagementsystem.entity.Holiday;
import com.diksha.leavemanagementsystem.entity.LeavePolicy;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeLeaveBalanceRepository;
import com.diksha.leavemanagementsystem.repository.HolidayRepository;
import com.diksha.leavemanagementsystem.repository.LeavePolicyRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.repository.spec.LeaveRequestSpecifications;
import com.diksha.leavemanagementsystem.service.ReportService;
import com.diksha.leavemanagementsystem.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Default {@link ReportService} implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final LeaveRepository leaveRepository;
    private final EmployeeLeaveBalanceRepository employeeLeaveBalanceRepository;
    private final HolidayRepository holidayRepository;
    private final LeavePolicyRepository leavePolicyRepository;
    private final UserRepository userRepository;

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
    public String getLoggedInCompanyName() {
        return getLoggedInCompany().getCompanyName();
    }

    @Override
    public List<LeaveReportRow> getLeaveReport(ReportFilterDto filter) {

        Company company = getLoggedInCompany();

        if (filter != null && filter.getStartDate() != null && filter.getEndDate() != null
                && filter.getStartDate().isAfter(filter.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        List<LeaveRequest> leaves = leaveRepository.findAll(
                LeaveRequestSpecifications.forCompanyWithFilters(company.getId(), filter));

        // Fetch each company holiday once and reuse for every row, instead
        // of re-querying holidays per leave request.
        Set<LocalDate> holidayDates = holidayRepository
                .findByCompanyIdOrderByHolidayDateAsc(company.getId())
                .stream()
                .map(Holiday::getHolidayDate)
                .collect(Collectors.toSet());

        return leaves.stream()
                .map(leave -> mapLeaveRow(leave, holidayDates))
                .toList();
    }

    @Override
    public List<EmployeeBalanceReportRow> getBalanceReport(ReportFilterDto filter) {

        Company company = getLoggedInCompany();

        List<EmployeeLeaveBalance> balances =
                employeeLeaveBalanceRepository.findByCompanyIdWithEmployee(company.getId());

        return balances.stream()
                .filter(balance -> matchesEmployeeFilter(balance, filter))
                .map(this::mapBalanceRow)
                .toList();
    }

    @Override
    public List<HolidayReportRow> getHolidayReport() {

        Company company = getLoggedInCompany();

        return holidayRepository.findByCompanyIdOrderByHolidayDateAsc(company.getId())
                .stream()
                .map(this::mapHolidayRow)
                .toList();
    }

    @Override
    public List<LeavePolicyReportRow> getPolicyReport() {

        Company company = getLoggedInCompany();

        return leavePolicyRepository.findByCompanyIdOrderByLeaveTypeAsc(company.getId())
                .stream()
                .map(this::mapPolicyRow)
                .toList();
    }

    private boolean matchesEmployeeFilter(EmployeeLeaveBalance balance, ReportFilterDto filter) {

        if (filter == null) {
            return true;
        }

        if (filter.getEmployeeId() != null
                && !filter.getEmployeeId().equals(balance.getEmployee().getId())) {
            return false;
        }

        if (filter.getDepartment() != null && !filter.getDepartment().isBlank()
                && !filter.getDepartment().trim().equalsIgnoreCase(balance.getEmployee().getDepartment())) {
            return false;
        }

        if (filter.getLeaveType() != null && filter.getLeaveType() != balance.getLeaveType()) {
            return false;
        }

        return true;
    }

    private LeaveReportRow mapLeaveRow(LeaveRequest leave, Set<LocalDate> holidayDates) {

        long totalDays = DateUtils.calculateLeaveDays(
                leave.getStartDate(), leave.getEndDate(), holidayDates);

        return LeaveReportRow.builder()
                .employeeName(leave.getEmployee().getFullName())
                .department(leave.getEmployee().getDepartment())
                .leaveType(leave.getLeaveType() != null ? leave.getLeaveType().name() : "")
                .status(leave.getStatus() != null ? leave.getStatus().name() : "")
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .totalDays(totalDays)
                .reason(leave.getReason())
                .appliedOn(leave.getAppliedOn())
                .managerRemarks(leave.getManagerRemarks())
                .build();
    }

    private EmployeeBalanceReportRow mapBalanceRow(EmployeeLeaveBalance balance) {
        return EmployeeBalanceReportRow.builder()
                .employeeName(balance.getEmployee().getFullName())
                .department(balance.getEmployee().getDepartment())
                .leaveType(balance.getLeaveType().name())
                .totalAllocated(balance.getTotalAllocated())
                .remainingBalance(balance.getRemainingBalance())
                .usedLeaves(balance.getTotalAllocated() - balance.getRemainingBalance())
                .build();
    }

    private HolidayReportRow mapHolidayRow(Holiday holiday) {
        return HolidayReportRow.builder()
                .holidayName(holiday.getHolidayName())
                .holidayDate(holiday.getHolidayDate())
                .description(holiday.getDescription())
                .optionalHoliday(holiday.isOptionalHoliday())
                .build();
    }

    private LeavePolicyReportRow mapPolicyRow(LeavePolicy policy) {
        return LeavePolicyReportRow.builder()
                .leaveType(policy.getLeaveType().name())
                .totalLeaves(policy.getTotalLeaves())
                .description(policy.getDescription())
                .active(policy.isActive())
                .build();
    }
}
