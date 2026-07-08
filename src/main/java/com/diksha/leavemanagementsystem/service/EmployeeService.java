package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.EmployeeRequestDto;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Logged in manager's company
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

    /**
     * Logged in employee
     */
    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));
    }

    /**
     * Add Employee (used by tests / legacy)
     */
    public EmployeeResponseDto addEmployee(EmployeeRequestDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists.");
        }

        Employee employee = Employee.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate())
                .leaveBalance(20)
                .build();

        return mapToDto(employeeRepository.save(employee));
    }

    /**
     * Create Employee
     */
    public EmployeeResponseDto createEmployee(EmployeeRequestDto dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username already exists.");
        }

        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists.");
        }

        Company company = getLoggedInCompany();

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.EMPLOYEE)
                .company(company)
                .build();

        Employee employee = Employee.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate())
                .leaveBalance(20)
                .company(company)
                .user(user)
                .build();

        user.setEmployee(employee);

        userRepository.save(user);

        return mapToDto(employee);
    }

    /**
     * Get all employees
     */
    public List<EmployeeResponseDto> getAllEmployees() {

        Company company = getLoggedInCompany();

        return employeeRepository.findByCompanyId(company.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Get employee by id
     */
    public EmployeeResponseDto getEmployeeById(Long id) {

        Company company = getLoggedInCompany();

        Employee employee = employeeRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        return mapToDto(employee);
    }

    /**
     * Update employee
     */
    public EmployeeResponseDto updateEmployee(Long id,
                                              EmployeeRequestDto dto) {

        Company company = getLoggedInCompany();

        Employee employee = employeeRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        employee.setFullName(dto.getFullName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());

        employeeRepository.save(employee);

        return mapToDto(employee);
    }

    /**
     * Delete employee
     */
    public String deleteEmployee(Long id) {

        Company company = getLoggedInCompany();

        Employee employee = employeeRepository
                .findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        employeeRepository.delete(employee);

        return "Employee deleted successfully";
    }

    /**
     * Search by department
     */
    public Page<EmployeeResponseDto> searchByDepartment(
            String department,
            Pageable pageable) {

        Company company = getLoggedInCompany();

        return employeeRepository
                .findByCompanyIdAndDepartmentContainingIgnoreCase(
                        company.getId(),
                        department,
                        pageable)
                .map(this::mapToDto);
    }

    /**
     * Pagination
     */
    public Page<EmployeeResponseDto> getEmployees(
            int page,
            int size,
            String sortBy) {

        Company company = getLoggedInCompany();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortBy));

        return employeeRepository
                .findByCompanyId(company.getId(), pageable)
                .map(this::mapToDto);
    }

    /**
     * Logged in profile
     */
    public EmployeeResponseDto getMyProfile() {

        Employee employee = getLoggedInEmployee();

        return mapToDto(employee);
    }

    /**
     * Entity -> DTO
     */
    private EmployeeResponseDto mapToDto(Employee employee) {

        return EmployeeResponseDto.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .joiningDate(employee.getJoiningDate())
                .leaveBalance(employee.getLeaveBalance())
                .build();
    }
}