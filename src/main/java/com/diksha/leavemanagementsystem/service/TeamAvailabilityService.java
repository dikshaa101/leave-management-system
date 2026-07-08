package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.response.AvailabilityDto;
import com.diksha.leavemanagementsystem.dto.response.DailyStatusDto;
import com.diksha.leavemanagementsystem.dto.response.TeamAvailabilityResponseDto;
import com.diksha.leavemanagementsystem.entity.*;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamAvailabilityService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;
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

    public AvailabilityDto getTodayAvailability() {
        return getAvailabilityByDate(LocalDate.now());
    }

    public AvailabilityDto getAvailabilityByDate(LocalDate date) {
        Company company = getLoggedInCompany();

        List<Employee> employees = employeeRepository.findByCompanyId(company.getId());

        List<LeaveRequest> approvedLeaves =
                leaveRepository
                        .findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                company.getId(),
                                date,
                                date
                        ).stream()
                        .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                        .toList();

        Set<Long> employeesOnLeaveIds = approvedLeaves.stream()
                .map(l -> l.getEmployee().getId())
                .collect(Collectors.toSet());

        List<String> onLeaveNames = approvedLeaves.stream()
                .map(l -> l.getEmployee().getFullName())
                .distinct()
                .toList();

        List<String> availableNames = employees.stream()
                .filter(e -> !employeesOnLeaveIds.contains(e.getId()))
                .map(Employee::getFullName)
                .toList();

        return AvailabilityDto.builder()
                .totalEmployees(employees.size())
                .employeesOnLeave(onLeaveNames.size())
                .availableEmployees(availableNames.size())
                .availableEmployeeNames(availableNames)
                .employeesOnLeaveNames(onLeaveNames)
                .build();
    }

    public AvailabilityDto getDepartmentAvailability(String department,
                                                     LocalDate date) {
        Company company = getLoggedInCompany();

        List<Employee> employees =
                employeeRepository.findByCompanyIdAndDepartmentIgnoreCase(company.getId(), department);

        List<LeaveRequest> approvedLeaves =
                leaveRepository
                        .findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                company.getId(),
                                date,
                                date
                        ).stream()
                        .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                        .filter(l -> l.getEmployee().getDepartment() != null && l.getEmployee().getDepartment().equalsIgnoreCase(department))
                        .toList();

        Set<Long> employeesOnLeaveIds =
                approvedLeaves.stream()
                        .map(leave -> leave.getEmployee().getId())
                        .collect(Collectors.toSet());

        List<String> onLeaveNames =
                approvedLeaves.stream()
                        .map(leave -> leave.getEmployee().getFullName())
                        .distinct()
                        .toList();

        List<String> availableNames =
                employees.stream()
                        .filter(employee ->
                                !employeesOnLeaveIds.contains(employee.getId()))
                        .map(Employee::getFullName)
                        .toList();

        return AvailabilityDto.builder()
                .totalEmployees(employees.size())
                .availableEmployees(availableNames.size())
                .employeesOnLeave(onLeaveNames.size())
                .availableEmployeeNames(availableNames)
                .employeesOnLeaveNames(onLeaveNames)
                .build();
    }

    public List<TeamAvailabilityResponseDto> getTeamAvailability(
            LocalDate startDate,
            LocalDate endDate,
            String department) {

        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate;
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        Company company = getLoggedInCompany();

        List<Employee> employees;
        if (department != null && !department.trim().isEmpty()) {
            employees = employeeRepository.findByCompanyIdAndDepartmentIgnoreCase(company.getId(), department.trim());
        } else {
            employees = employeeRepository.findByCompanyId(company.getId());
        }

        List<LeaveRequest> overlappingLeaves = leaveRepository
                .findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        company.getId(),
                        endDate,
                        startDate
                );

        List<TeamAvailabilityResponseDto> result = new ArrayList<>();

        for (Employee emp : employees) {
            List<DailyStatusDto> dailyStatuses = new ArrayList<>();
            LocalDate current = startDate;

            boolean hasApproved = false;
            boolean hasPending = false;

            while (!current.isAfter(endDate)) {
                final LocalDate checkDate = current;

                List<LeaveRequest> empLeavesOnDate = overlappingLeaves.stream()
                        .filter(l -> l.getEmployee().getId().equals(emp.getId()))
                        .filter(l -> !checkDate.isBefore(l.getStartDate()) && !checkDate.isAfter(l.getEndDate()))
                        .toList();

                String status = "AVAILABLE";

                boolean isApproved = empLeavesOnDate.stream()
                        .anyMatch(l -> l.getStatus() == LeaveStatus.APPROVED);

                boolean isPending = empLeavesOnDate.stream()
                        .anyMatch(l -> l.getStatus() == LeaveStatus.PENDING);

                if (isApproved) {
                    status = "ON_LEAVE";
                    hasApproved = true;
                } else if (isPending) {
                    status = "PENDING_LEAVE";
                    hasPending = true;
                }

                dailyStatuses.add(DailyStatusDto.builder()
                        .date(checkDate)
                        .status(status)
                        .build());

                current = current.plusDays(1);
            }

            String overallStatus = "AVAILABLE";
            if (hasApproved) {
                overallStatus = "ON_LEAVE";
            } else if (hasPending) {
                overallStatus = "PENDING_LEAVE";
            }

            result.add(TeamAvailabilityResponseDto.builder()
                    .employeeId(emp.getId())
                    .fullName(emp.getFullName())
                    .department(emp.getDepartment())
                    .status(overallStatus)
                    .dailyStatuses(dailyStatuses)
                    .build());
        }

        return result;
    }
}