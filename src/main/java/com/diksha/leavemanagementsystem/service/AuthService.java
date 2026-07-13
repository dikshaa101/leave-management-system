package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LoginRequest;
import com.diksha.leavemanagementsystem.dto.request.RegisterRequest;
import com.diksha.leavemanagementsystem.dto.response.JwtResponse;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.event.EmployeeRegisteredEvent;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.CompanyRepository;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.security.JwtUtil;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final ApplicationEventPublisher eventPublisher;
    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;

    public String register(RegisterRequest request) {

        // Username validation
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists.");
        }

        // Email validation
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists.");
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.MANAGER;
        Company company;

        if (userRole == Role.EMPLOYEE) {
            // Join existing company
            company = companyRepository.findByCompanyCode(request.getCompanyCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        } else {
            // Manager registration: Create Company
            // Company Code validation
            if (companyRepository.existsByCompanyCode(request.getCompanyCode())) {
                throw new BadRequestException("Company code already exists.");
            }

            // Company Name validation
            if (companyRepository.existsByCompanyName(request.getCompanyName())) {
                throw new BadRequestException("Company name already exists.");
            }

            // Company Name should not be blank
            if (request.getCompanyName() == null ||
                    request.getCompanyName().trim().isEmpty()) {
                throw new BadRequestException("Company name is required.");
            }

            company = Company.builder()
                    .companyName(request.getCompanyName())
                    .companyCode(request.getCompanyCode())
                    .build();

            company = companyRepository.save(company);
        }

        // Create User
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .company(company)
                .build();

        // Create Employee
        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .joiningDate(request.getJoiningDate())
                .company(company)
                .user(user)
                .build();

        user.setEmployee(employee);

        userRepository.save(user);

        // Backfills balances immediately if the company already has active
        // policies (e.g. an employee joining an existing company);
        // otherwise a no-op until the manager creates the first policy.
        employeeLeaveBalanceService.ensureBalancesForEmployee(employee);

        eventPublisher.publishEvent(
                EmployeeRegisteredEvent.builder()
                        .employeeName(employee.getFullName())
                        .employeeEmail(employee.getEmail())
                        .username(user.getUsername())
                        .companyName(company.getCompanyName())
                        .department(employee.getDepartment())
                        .designation(employee.getDesignation())
                        .role(userRole.name())
                        .build()
        );

        return "User Registered Successfully";
    }

    public JwtResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.getUsername());

        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BadRequestException("User not found."));

        return new JwtResponse(
                token,
                user.getUsername(),
                user.getRole()
        );
    }
}