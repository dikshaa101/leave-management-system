package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.request.LoginRequest;
import com.diksha.leavemanagementsystem.dto.request.RegisterRequest;
import com.diksha.leavemanagementsystem.dto.response.JwtResponse;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.repository.CompanyRepository;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.security.JwtUtil;
import com.diksha.leavemanagementsystem.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password123");
        registerRequest.setEmail("test@example.com");
        registerRequest.setFullName("Test User");
        registerRequest.setPhone("1234567890");
        registerRequest.setDepartment("IT");
        registerRequest.setDesignation("Developer");
        registerRequest.setRole(Role.EMPLOYEE);
        registerRequest.setCompanyCode("COMP101");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        user = User.builder()
                .id(1L)
                .username("testuser")
                .password("encoded_password")
                .role(Role.EMPLOYEE)
                .build();
    }

    @Test
    void testRegisterSuccess() {
        Company company = Company.builder()
                .id(1L)
                .companyCode("COMP101")
                .companyName("Test Company")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(employeeRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(companyRepository.findByCompanyCode("COMP101")).thenReturn(Optional.of(company));
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);

        String result = authService.register(registerRequest);

        assertEquals("User Registered Successfully", result);
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(employeeRepository, times(1)).existsByEmail("test@example.com");
        verify(companyRepository, times(1)).findByCompanyCode("COMP101");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUserAlreadyExists() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt_token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken("testuser", null));

        JwtResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals(Role.EMPLOYEE, response.getRole());
        verify(authenticationManager, times(1)).authenticate(any());
        verify(userDetailsService, times(1)).loadUserByUsername("testuser");
    }

    @Test
    void testLoginUserNotFound() {
        UserDetails userDetails = mock(UserDetails.class);
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken("testuser", null));
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt_token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    void testLoginWithBadCredentialsThrowsException() {
        doThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThrows(Exception.class, () -> authService.login(loginRequest));
        verify(userDetailsService, never()).loadUserByUsername(any());
    }

    @Test
    void testRegisterWithDifferentRoles() {
        RegisterRequest managerRequest = new RegisterRequest();
        managerRequest.setUsername("manager");
        managerRequest.setPassword("password123");
        managerRequest.setEmail("manager@example.com");
        managerRequest.setFullName("Manager User");
        managerRequest.setPhone("9876543210");
        managerRequest.setDepartment("Management");
        managerRequest.setDesignation("Manager");
        managerRequest.setRole(Role.MANAGER);
        managerRequest.setCompanyCode("MGR_COMP");
        managerRequest.setCompanyName("Manager Company");

        Company company = Company.builder()
                .id(2L)
                .companyCode("MGR_COMP")
                .companyName("Manager Company")
                .build();

        when(userRepository.existsByUsername("manager")).thenReturn(false);
        when(employeeRepository.existsByEmail("manager@example.com")).thenReturn(false);
        when(companyRepository.existsByCompanyCode("MGR_COMP")).thenReturn(false);
        when(companyRepository.existsByCompanyName("Manager Company")).thenReturn(false);
        when(companyRepository.save(any(Company.class))).thenReturn(company);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);

        String result = authService.register(managerRequest);

        assertEquals("User Registered Successfully", result);
        verify(userRepository, times(1)).save(any(User.class));
    }
}
