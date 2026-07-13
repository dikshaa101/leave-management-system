package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.event.LeaveApprovedEvent;
import com.diksha.leavemanagementsystem.event.LeaveRejectedEvent;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveService leaveService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Returns logged-in manager's company.
     */
    private Company getCurrentCompany() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        Employee manager = employeeRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));

        return manager.getCompany();
    }

    /**
     * Returns all pending leave requests of the manager's company.
     */
    public List<LeaveResponseDto> getPendingLeaves() {

        Company company = getCurrentCompany();

        return leaveRepository
                .findByStatusAndEmployeeCompany(
                        LeaveStatus.PENDING,
                        company)
                .stream()
                .map(leaveService::mapToDto)
                .toList();
    }

    /**
     * Approve leave request.
     */
    public String approveLeave(Long leaveId,
                               ApprovalRequestDto dto) {

        Company company = getCurrentCompany();

        LeaveRequest leave = leaveRepository
                .findByIdAndEmployeeCompany(
                        leaveId,
                        company)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending leave can be approved.");
        }

        Employee employee = leave.getEmployee();

        int leaveDays = (int) leaveService.calculateLeaveDays(
                employee.getCompany(),
                leave.getStartDate(),
                leave.getEndDate());

        if (leaveDays > employee.getLeaveBalance()) {
            throw new RuntimeException(
                    "Employee does not have enough leave balance.");
        }

        employee.setLeaveBalance(
                employee.getLeaveBalance() - leaveDays);

        employeeRepository.save(employee);

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setManagerRemarks(dto.getRemarks());
        leave.setActionDate(LocalDate.now());

        leaveRepository.save(leave);

        eventPublisher.publishEvent(
                LeaveApprovedEvent.builder()
                        .recipientEmail(employee.getEmail())
                        .employeeName(employee.getFullName())
                        .leaveType(leave.getLeaveType().name())
                        .startDate(leave.getStartDate())
                        .endDate(leave.getEndDate())
                        .totalDays(leaveDays)
                        .remarks(leave.getManagerRemarks())
                        .actionDate(leave.getActionDate())
                        .build()
        );

        return "Leave approved successfully.";
    }

    /**
     * Reject leave request.
     */
    public String rejectLeave(Long leaveId,
                              ApprovalRequestDto dto) {

        Company company = getCurrentCompany();

        LeaveRequest leave = leaveRepository
                .findByIdAndEmployeeCompany(
                        leaveId,
                        company)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending leave can be rejected.");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setManagerRemarks(dto.getRemarks());
        leave.setActionDate(LocalDate.now());

        leaveRepository.save(leave);

        long leaveDays = leaveService.calculateLeaveDays(
                leave.getEmployee().getCompany(),
                leave.getStartDate(),
                leave.getEndDate());

        eventPublisher.publishEvent(
                LeaveRejectedEvent.builder()
                        .recipientEmail(leave.getEmployee().getEmail())
                        .employeeName(leave.getEmployee().getFullName())
                        .leaveType(leave.getLeaveType().name())
                        .startDate(leave.getStartDate())
                        .endDate(leave.getEndDate())
                        .totalDays(leaveDays)
                        .remarks(leave.getManagerRemarks())
                        .actionDate(leave.getActionDate())
                        .build()
        );

        return "Leave rejected successfully.";
    }
}