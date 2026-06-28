package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.response.AvailabilityDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamAvailabilityService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRepository leaveRepository;

    public AvailabilityDto getTodayAvailability() {

        return getAvailabilityByDate(LocalDate.now());
    }

    public AvailabilityDto getAvailabilityByDate(LocalDate date) {

        List<Employee> employees = employeeRepository.findAll();

        List<LeaveRequest> approvedLeaves =
                leaveRepository
                        .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                LeaveStatus.APPROVED,
                                date,
                                date
                        );

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

        List<Employee> employees =
                employeeRepository.findByDepartmentIgnoreCase(department);

        List<LeaveRequest> approvedLeaves =
                leaveRepository
                        .findByStatusAndEmployeeDepartmentIgnoreCaseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                LeaveStatus.APPROVED,
                                department,
                                date,
                                date
                        );

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


}