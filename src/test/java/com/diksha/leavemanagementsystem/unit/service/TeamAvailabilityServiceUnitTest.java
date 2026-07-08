package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.response.AvailabilityDto;
import com.diksha.leavemanagementsystem.dto.response.TeamAvailabilityResponseDto;
import com.diksha.leavemanagementsystem.entity.*;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.TeamAvailabilityService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamAvailabilityServiceUnitTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TeamAvailabilityService teamAvailabilityService;

    private Company company;
    private User user;
    private Employee employee1;
    private Employee employee2;
    private LeaveRequest approvedLeave;
    private LeaveRequest pendingLeave;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .companyCode("COMP101")
                .companyName("Test Company")
                .build();

        user = User.builder()
                .id(1L)
                .username("manageruser")
                .company(company)
                .build();

        employee1 = Employee.builder()
                .id(1L)
                .fullName("Employee One")
                .department("IT")
                .company(company)
                .build();

        employee2 = Employee.builder()
                .id(2L)
                .fullName("Employee Two")
                .department("IT")
                .company(company)
                .build();

        approvedLeave = LeaveRequest.builder()
                .id(1L)
                .employee(employee1)
                .status(LeaveStatus.APPROVED)
                .leaveType(LeaveType.CASUAL)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .build();

        pendingLeave = LeaveRequest.builder()
                .id(2L)
                .employee(employee2)
                .status(LeaveStatus.PENDING)
                .leaveType(LeaveType.SICK)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken("manageruser", null);
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetTodayAvailability() {
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, LocalDate.now(), LocalDate.now()
        )).thenReturn(List.of(approvedLeave));

        AvailabilityDto dto = teamAvailabilityService.getTodayAvailability();

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(1, dto.getEmployeesOnLeave());
        assertEquals(1, dto.getAvailableEmployees());
        assertTrue(dto.getEmployeesOnLeaveNames().contains("Employee One"));
        assertTrue(dto.getAvailableEmployeeNames().contains("Employee Two"));
        assertFalse(dto.getAvailableEmployeeNames().contains("Employee One"));
    }

    @Test
    void testGetAvailabilityByDate() {
        LocalDate date = LocalDate.of(2025, 1, 5);
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, date, date
        )).thenReturn(List.of(approvedLeave));

        AvailabilityDto dto = teamAvailabilityService.getAvailabilityByDate(date);

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(1, dto.getEmployeesOnLeave());
        assertEquals(1, dto.getAvailableEmployees());
    }

    @Test
    void testGetDepartmentAvailability() {
        LocalDate date = LocalDate.now();
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyIdAndDepartmentIgnoreCase(1L, "IT")).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, date, date
        )).thenReturn(List.of(approvedLeave));

        AvailabilityDto dto = teamAvailabilityService.getDepartmentAvailability("IT", date);

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(1, dto.getEmployeesOnLeave());
        assertEquals(1, dto.getAvailableEmployees());
        assertTrue(dto.getAvailableEmployeeNames().contains("Employee Two"));
    }

    @Test
    void testGetTodayAvailability_allEmployeesPresent() {
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, LocalDate.now(), LocalDate.now()
        )).thenReturn(List.of());

        AvailabilityDto dto = teamAvailabilityService.getTodayAvailability();

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(0, dto.getEmployeesOnLeave());
        assertEquals(2, dto.getAvailableEmployees());
    }

    @Test
    void testGetTodayAvailability_noEmployees() {
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of());
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, LocalDate.now(), LocalDate.now()
        )).thenReturn(List.of());

        AvailabilityDto dto = teamAvailabilityService.getTodayAvailability();

        assertEquals(0, dto.getTotalEmployees());
        assertEquals(0, dto.getEmployeesOnLeave());
        assertEquals(0, dto.getAvailableEmployees());
    }

    @Test
    void testGetTeamAvailability_singleDate() {
        LocalDate date = LocalDate.now();
        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, date, date
        )).thenReturn(List.of(approvedLeave, pendingLeave));

        List<TeamAvailabilityResponseDto> list = teamAvailabilityService.getTeamAvailability(date, date, null);

        assertEquals(2, list.size());

        TeamAvailabilityResponseDto first = list.stream().filter(e -> e.getEmployeeId().equals(1L)).findFirst().orElseThrow();
        assertEquals("ON_LEAVE", first.getStatus());
        assertEquals(1, first.getDailyStatuses().size());
        assertEquals("ON_LEAVE", first.getDailyStatuses().get(0).getStatus());

        TeamAvailabilityResponseDto second = list.stream().filter(e -> e.getEmployeeId().equals(2L)).findFirst().orElseThrow();
        assertEquals("PENDING_LEAVE", second.getStatus());
        assertEquals(1, second.getDailyStatuses().size());
        assertEquals("PENDING_LEAVE", second.getDailyStatuses().get(0).getStatus());
    }

    @Test
    void testGetTeamAvailability_dateRange() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(2);

        approvedLeave.setStartDate(start);
        approvedLeave.setEndDate(start.plusDays(1)); // Approved leave on day 0 and day 1

        pendingLeave.setStartDate(start.plusDays(2));
        pendingLeave.setEndDate(start.plusDays(2)); // Pending leave on day 2

        when(userRepository.findByUsername("manageruser")).thenReturn(Optional.of(user));
        when(employeeRepository.findByCompanyId(1L)).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByEmployeeCompanyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                1L, end, start
        )).thenReturn(List.of(approvedLeave, pendingLeave));

        List<TeamAvailabilityResponseDto> list = teamAvailabilityService.getTeamAvailability(start, end, null);

        assertEquals(2, list.size());

        // Employee 1: Day 0 = ON_LEAVE, Day 1 = ON_LEAVE, Day 2 = AVAILABLE -> Overall = ON_LEAVE
        TeamAvailabilityResponseDto first = list.stream().filter(e -> e.getEmployeeId().equals(1L)).findFirst().orElseThrow();
        assertEquals("ON_LEAVE", first.getStatus());
        assertEquals(3, first.getDailyStatuses().size());
        assertEquals("ON_LEAVE", first.getDailyStatuses().get(0).getStatus()); // Day 0
        assertEquals("ON_LEAVE", first.getDailyStatuses().get(1).getStatus()); // Day 1
        assertEquals("AVAILABLE", first.getDailyStatuses().get(2).getStatus()); // Day 2

        // Employee 2: Day 0 = AVAILABLE, Day 1 = AVAILABLE, Day 2 = PENDING_LEAVE -> Overall = PENDING_LEAVE
        TeamAvailabilityResponseDto second = list.stream().filter(e -> e.getEmployeeId().equals(2L)).findFirst().orElseThrow();
        assertEquals("PENDING_LEAVE", second.getStatus());
        assertEquals(3, second.getDailyStatuses().size());
        assertEquals("AVAILABLE", second.getDailyStatuses().get(0).getStatus());
        assertEquals("AVAILABLE", second.getDailyStatuses().get(1).getStatus());
        assertEquals("PENDING_LEAVE", second.getDailyStatuses().get(2).getStatus());
    }
}
