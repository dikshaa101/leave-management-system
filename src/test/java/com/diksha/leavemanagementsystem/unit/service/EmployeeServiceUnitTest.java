package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.request.EmployeeRequestDto;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.EmployeeService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceUnitTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;
    private EmployeeRequestDto requestDto;
    private SecurityContext securityContext;
    private Company company;
    private User user;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .companyName("Test Company")
                .companyCode("COMP101")
                .build();

        user = User.builder()
                .id(1L)
                .username("testuser")
                .company(company)
                .build();

        employee = Employee.builder()
                .id(1L)
                .fullName("Test Employee")
                .email("test@example.com")
                .phone("1234567890")
                .department("IT")
                .designation("Developer")
                .joiningDate(LocalDate.now())
                .leaveBalance(20)
                .company(company)
                .build();

        requestDto = new EmployeeRequestDto();
        requestDto.setFullName("Test Employee");
        requestDto.setEmail("test@example.com");
        requestDto.setPhone("1234567890");
        requestDto.setDepartment("IT");
        requestDto.setDesignation("Developer");
        requestDto.setJoiningDate(LocalDate.now());
        requestDto.setUsername("testuser");
        requestDto.setPassword("password123");
    }

    private void setSecurityContextForUsername(String username) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null);
        securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        clearInvocations(employeeRepository);
    }

    @Test
    void testAddEmployeeSuccess() {
        when(employeeRepository.existsByEmail(requestDto.getEmail())).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        EmployeeResponseDto response = employeeService.addEmployee(requestDto);

        assertNotNull(response);
        assertEquals("Test Employee", response.getFullName());
        assertEquals(20, response.getLeaveBalance());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void testAddEmployeeAlreadyExists() {
        when(employeeRepository.existsByEmail(requestDto.getEmail())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> employeeService.addEmployee(requestDto));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void testGetAllEmployees() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee));

        List<EmployeeResponseDto> results = employeeService.getAllEmployees();

        assertEquals(1, results.size());
        assertEquals("Test Employee", results.get(0).getFullName());
    }

    @Test
    void testGetEmployeeByIdSuccess() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(employee));

        EmployeeResponseDto response = employeeService.getEmployeeById(1L);

        assertEquals("Test Employee", response.getFullName());
    }

    @Test
    void testGetEmployeeByIdNotFound() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(1L));
    }

    @Test
    void testUpdateEmployeeSuccess() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        requestDto.setFullName("Updated Employee");
        EmployeeResponseDto response = employeeService.updateEmployee(1L, requestDto);

        assertEquals("Updated Employee", response.getFullName());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void testUpdateEmployeeNotFound() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.updateEmployee(1L, requestDto));
    }

    @Test
    void testDeleteEmployeeSuccess() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(employee));

        String response = employeeService.deleteEmployee(1L);

        assertEquals("Employee deleted successfully", response);
        verify(employeeRepository, times(1)).delete(employee);
    }

    @Test
    void testDeleteEmployeeNotFound() {
        setSecurityContextForUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.deleteEmployee(1L));
    }

    @Test
    void testSearchByDepartment() {
        setSecurityContextForUsername("testuser");
        Pageable pageable = PageRequest.of(0, 5);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyIdAndDepartmentContainingIgnoreCase(1L, "IT", pageable))
                .thenReturn(new PageImpl<>(List.of(employee)));

        var page = employeeService.searchByDepartment("IT", pageable);

        assertEquals(1, page.getTotalElements());
        assertEquals("Test Employee", page.getContent().get(0).getFullName());
    }

    @Test
    void testGetEmployees() {
        setSecurityContextForUsername("testuser");
        Pageable pageable = PageRequest.of(0, 5, Sort.by("fullName"));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(employee)));

        var page = employeeService.getEmployees(0, 5, "fullName");

        assertEquals(1, page.getTotalElements());
    }

    @Test
    void testGetMyProfileSuccess() {
        setSecurityContextForUsername("testuser");
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));

        EmployeeResponseDto response = employeeService.getMyProfile();

        assertEquals("Test Employee", response.getFullName());
    }

    @Test
    void testGetMyProfileNotFound() {
        setSecurityContextForUsername("testuser");
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getMyProfile());
    }
}
