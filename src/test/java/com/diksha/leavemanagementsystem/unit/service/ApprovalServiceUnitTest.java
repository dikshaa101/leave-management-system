package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.*;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.service.ApprovalService;
import com.diksha.leavemanagementsystem.service.LeaveService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceUnitTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private LeaveService leaveService;

    @InjectMocks
    private ApprovalService approvalService;

    private Company company;
    private Employee manager;
    private Employee employee;
    private LeaveRequest leaveRequest;
    private ApprovalRequestDto approvalRequestDto;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .companyCode("COMP101")
                .companyName("Test Company")
                .build();

        manager = Employee.builder()
                .id(2L)
                .fullName("Manager User")
                .company(company)
                .build();

        employee = Employee.builder()
                .id(1L)
                .fullName("Test Employee")
                .leaveBalance(10)
                .company(company)
                .build();

        leaveRequest = LeaveRequest.builder()
                .id(1L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .status(LeaveStatus.PENDING)
                .leaveType(LeaveType.CASUAL)
                .employee(employee)
                .build();

        approvalRequestDto = new ApprovalRequestDto();
        approvalRequestDto.setRemarks("Approved");

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
    void testGetPendingLeaves() {
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByStatusAndEmployeeCompany(LeaveStatus.PENDING, company)).thenReturn(List.of(leaveRequest));
        when(leaveService.mapToDto(leaveRequest)).thenReturn(LeaveResponseDto.builder()
                .id(1L)
                .status(LeaveStatus.PENDING)
                .employeeName("Test Employee")
                .build());

        var result = approvalService.getPendingLeaves();

        assertEquals(1, result.size());
        assertEquals(LeaveStatus.PENDING, result.get(0).getStatus());
        verify(leaveRepository, times(1)).findByStatusAndEmployeeCompany(LeaveStatus.PENDING, company);
    }

    @Test
    void testApproveLeaveSuccess() {
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        String result = approvalService.approveLeave(1L, approvalRequestDto);

        assertEquals("Leave approved successfully.", result);
        assertEquals(LeaveStatus.APPROVED, leaveRequest.getStatus());
        assertNotNull(leaveRequest.getActionDate());
        verify(employeeRepository, times(1)).save(employee);
        verify(leaveRepository, times(1)).save(leaveRequest);
    }

    @Test
    void testApproveLeaveNotFound() {
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testApproveLeaveNotPending() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testApproveLeaveInsufficientBalance() {
        employee.setLeaveBalance(1);
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testRejectLeaveSuccess() {
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        String result = approvalService.rejectLeave(1L, approvalRequestDto);

        assertEquals("Leave rejected successfully.", result);
        assertEquals(LeaveStatus.REJECTED, leaveRequest.getStatus());
        assertNotNull(leaveRequest.getActionDate());
        verify(leaveRepository, times(1)).save(leaveRequest);
    }

    @Test
    void testRejectLeaveNotFound() {
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> approvalService.rejectLeave(1L, approvalRequestDto));
    }

    @Test
    void testRejectLeaveNotPending() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        when(employeeRepository.findByUserUsername("manageruser")).thenReturn(Optional.of(manager));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.rejectLeave(1L, approvalRequestDto));
    }
}
