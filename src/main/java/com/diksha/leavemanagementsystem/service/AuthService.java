package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LoginRequest;
import com.diksha.leavemanagementsystem.dto.request.RegisterRequest;
import com.diksha.leavemanagementsystem.dto.response.JwtResponse;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.repository.CompanyRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
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
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public String register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists.");
        }

        if (companyRepository.existsByCompanyCode(request.getCompanyCode())) {
            throw new RuntimeException("Company code already exists.");
        }

        if (request.getCompanyName() == null ||
                request.getCompanyName().isBlank()) {
            throw new RuntimeException("Company name is required.");
        }

        Company company = Company.builder()
                .companyName(request.getCompanyName())
                .companyCode(request.getCompanyCode())
                .build();

        company = companyRepository.save(company);

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MANAGER)
                .company(company)
                .build();

        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .joiningDate(request.getJoiningDate())
                .leaveBalance(20)
                .company(company)
                .user(user)
                .build();

        user.setEmployee(employee);

        userRepository.save(user);

        return "Manager registered successfully.";
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
                .orElseThrow(() -> new RuntimeException("User not found."));

        return new JwtResponse(
                token,
                user.getUsername(),
                user.getRole()
        );
    }
}