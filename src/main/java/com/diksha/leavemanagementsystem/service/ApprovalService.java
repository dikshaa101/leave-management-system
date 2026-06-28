package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveService leaveService;

    public List<LeaveResponseDto> getPendingLeaves() {

        return leaveRepository.findByStatus(LeaveStatus.PENDING)
                .stream()
                .map(leaveService::mapToDto)
                .toList();
    }

    public String approveLeave(Long leaveId,
                               ApprovalRequestDto dto) {

        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave can be approved.");
        }

        Employee employee = leave.getEmployee();

        int leaveDays = (int) (ChronoUnit.DAYS.between(
                leave.getStartDate(),
                leave.getEndDate()) + 1);

        if (leaveDays > employee.getLeaveBalance()) {
            throw new RuntimeException("Employee does not have enough leave balance.");
        }

        employee.setLeaveBalance(employee.getLeaveBalance() - leaveDays);

        employeeRepository.save(employee);

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setManagerRemarks(dto.getRemarks());
        leave.setActionDate(LocalDate.now());

        leaveRepository.save(leave);

        return "Leave approved successfully.";
    }

    public String rejectLeave(Long leaveId,
                              ApprovalRequestDto dto) {

        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave can be rejected.");
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setManagerRemarks(dto.getRemarks());
        leave.setActionDate(LocalDate.now());

        leaveRepository.save(leave);

        return "Leave rejected successfully.";
    }

}