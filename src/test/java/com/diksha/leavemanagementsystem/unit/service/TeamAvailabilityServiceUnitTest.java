package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.response.AvailabilityDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.service.TeamAvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamAvailabilityServiceUnitTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private TeamAvailabilityService teamAvailabilityService;

    private Employee employee1;
    private Employee employee2;
    private LeaveRequest approvedLeave;

    @BeforeEach
    void setUp() {
        employee1 = Employee.builder()
                .id(1L)
                .fullName("Employee One")
                .department("IT")
                .build();

        employee2 = Employee.builder()
                .id(2L)
                .fullName("Employee Two")
                .department("IT")
                .build();

        approvedLeave = LeaveRequest.builder()
                .id(1L)
                .employee(employee1)
                .status(LeaveStatus.APPROVED)
                .leaveType(LeaveType.CASUAL)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .build();
    }

    @Test
    void testGetTodayAvailability() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                LeaveStatus.APPROVED,
                LocalDate.now(),
                LocalDate.now()
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
        when(employeeRepository.findAll()).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                LeaveStatus.APPROVED,
                date,
                date
        )).thenReturn(List.of(approvedLeave));

        AvailabilityDto dto = teamAvailabilityService.getAvailabilityByDate(date);

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(1, dto.getEmployeesOnLeave());
        assertEquals(1, dto.getAvailableEmployees());
    }

    @Test
    void testGetDepartmentAvailability() {
        LocalDate date = LocalDate.now();
        when(employeeRepository.findByDepartmentIgnoreCase("IT")).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByStatusAndEmployeeDepartmentIgnoreCaseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                LeaveStatus.APPROVED,
                "IT",
                date,
                date
        )).thenReturn(List.of(approvedLeave));

        AvailabilityDto dto = teamAvailabilityService.getDepartmentAvailability("IT", date);

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(1, dto.getEmployeesOnLeave());
        assertEquals(1, dto.getAvailableEmployees());
        assertTrue(dto.getAvailableEmployeeNames().contains("Employee Two"));
    }

    @Test
    void testGetTodayAvailability_allEmployeesPresent() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee1, employee2));
        when(leaveRepository.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                LeaveStatus.APPROVED,
                LocalDate.now(),
                LocalDate.now()
        )).thenReturn(List.of());

        AvailabilityDto dto = teamAvailabilityService.getTodayAvailability();

        assertEquals(2, dto.getTotalEmployees());
        assertEquals(0, dto.getEmployeesOnLeave());
        assertEquals(2, dto.getAvailableEmployees());
    }

    @Test
    void testGetTodayAvailability_noEmployees() {
        when(employeeRepository.findAll()).thenReturn(List.of());
        when(leaveRepository.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                LeaveStatus.APPROVED,
                LocalDate.now(),
                LocalDate.now()
        )).thenReturn(List.of());

        AvailabilityDto dto = teamAvailabilityService.getTodayAvailability();

        assertEquals(0, dto.getTotalEmployees());
        assertEquals(0, dto.getEmployeesOnLeave());
        assertEquals(0, dto.getAvailableEmployees());
    }
}
