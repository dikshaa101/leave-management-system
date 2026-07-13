package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.CreateEmployeeRequest;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.event.EmployeeRegisteredEvent;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeAccountService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;

    public EmployeeResponseDto createEmployee(CreateEmployeeRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String managerUsername = authentication.getName();

        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));

        Company company = manager.getCompany();

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists.");
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }

        User employeeUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .company(company)
                .build();

        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .joiningDate(request.getJoiningDate())
                .company(company)
                .user(employeeUser)
                .build();

        employeeUser.setEmployee(employee);

        userRepository.save(employeeUser);

        employeeLeaveBalanceService.ensureBalancesForEmployee(employee);

        eventPublisher.publishEvent(
                EmployeeRegisteredEvent.builder()
                        .employeeName(employee.getFullName())
                        .employeeEmail(employee.getEmail())
                        .username(employeeUser.getUsername())
                        .companyName(company.getCompanyName())
                        .department(employee.getDepartment())
                        .designation(employee.getDesignation())
                        .role(Role.EMPLOYEE.name())
                        .build()
        );

        return mapToDto(employee);
    }

    private EmployeeResponseDto mapToDto(Employee employee) {

        return EmployeeResponseDto.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .joiningDate(employee.getJoiningDate())
                .leaveBalances(employeeLeaveBalanceService.getBalancesForEmployee(employee))
                .build();
    }
}