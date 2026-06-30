package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.entity.LeaveType;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.service.ApprovalService;
import com.diksha.leavemanagementsystem.service.LeaveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    private Employee employee;
    private LeaveRequest leaveRequest;
    private ApprovalRequestDto approvalRequestDto;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .fullName("Test Employee")
                .leaveBalance(10)
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
    }

    @Test
    void testGetPendingLeaves() {
        when(leaveRepository.findByStatus(LeaveStatus.PENDING)).thenReturn(List.of(leaveRequest));
        when(leaveService.mapToDto(leaveRequest)).thenReturn(LeaveResponseDto.builder()
                .id(1L)
                .status(LeaveStatus.PENDING)
                .employeeName("Test Employee")
                .build());

        var result = approvalService.getPendingLeaves();

        assertEquals(1, result.size());
        assertEquals(LeaveStatus.PENDING, result.get(0).getStatus());
        verify(leaveRepository, times(1)).findByStatus(LeaveStatus.PENDING);
    }

    @Test
    void testApproveLeaveSuccess() {
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));
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
        when(leaveRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testApproveLeaveNotPending() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testApproveLeaveInsufficientBalance() {
        employee.setLeaveBalance(1);
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.approveLeave(1L, approvalRequestDto));
    }

    @Test
    void testRejectLeaveSuccess() {
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        String result = approvalService.rejectLeave(1L, approvalRequestDto);

        assertEquals("Leave rejected successfully.", result);
        assertEquals(LeaveStatus.REJECTED, leaveRequest.getStatus());
        assertNotNull(leaveRequest.getActionDate());
        verify(leaveRepository, times(1)).save(leaveRequest);
    }

    @Test
    void testRejectLeaveNotFound() {
        when(leaveRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> approvalService.rejectLeave(1L, approvalRequestDto));
    }

    @Test
    void testRejectLeaveNotPending() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> approvalService.rejectLeave(1L, approvalRequestDto));
    }
}
