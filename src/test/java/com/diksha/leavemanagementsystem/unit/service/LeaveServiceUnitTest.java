package com.diksha.leavemanagementsystem.unit.service;

import com.diksha.leavemanagementsystem.dto.request.LeaveRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.*;
import com.diksha.leavemanagementsystem.exception.BadRequestException;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeavePolicyRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import com.diksha.leavemanagementsystem.service.HolidayService;
import com.diksha.leavemanagementsystem.service.LeaveService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceUnitTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private HolidayService holidayService;

    @Mock
    private LeavePolicyRepository leavePolicyRepository;

    @Mock
    private EmployeeLeaveBalanceService employeeLeaveBalanceService;

    @InjectMocks
    private LeaveService leaveService;

    private Employee employee;
    private LeaveRequest leaveRequest;
    private LeaveRequestDto leaveRequestDto;
    private Authentication authentication;
    private Company company;
    private User user;
    private LeavePolicy sickPolicy;

    @BeforeEach
    void setUp() {
        company = Company.builder()
                .id(1L)
                .companyCode("COMP101")
                .companyName("Test Company")
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
                .company(company)
                .build();

        sickPolicy = LeavePolicy.builder()
                .id(1L)
                .company(company)
                .leaveType(LeaveType.SICK)
                .totalLeaves(20)
                .active(true)
                .build();

        leaveRequestDto = new LeaveRequestDto();
        leaveRequestDto.setStartDate(LocalDate.now().plusDays(5));
        leaveRequestDto.setEndDate(LocalDate.now().plusDays(10));
        leaveRequestDto.setReason("Personal");
        leaveRequestDto.setLeaveType(LeaveType.SICK);

        leaveRequest = LeaveRequest.builder()
                .id(1L)
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(10))
                .reason("Personal")
                .leaveType(LeaveType.SICK)
                .status(LeaveStatus.PENDING)
                .appliedOn(LocalDate.now())
                .employee(employee)
                .build();

        authentication = new UsernamePasswordAuthenticationToken("testuser", null);
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        lenient().when(holidayService.getHolidayDatesInRange(any(), any(), any()))
                .thenReturn(Set.of());
    }

    @Test
    void testApplyLeaveSuccess() {
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leavePolicyRepository.findByCompanyIdAndLeaveTypeAndActiveTrue(company.getId(), LeaveType.SICK))
                .thenReturn(Optional.of(sickPolicy));
        when(leaveRepository.existsByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                employee, leaveRequestDto.getEndDate(), leaveRequestDto.getStartDate())).thenReturn(false);
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveResponseDto result = leaveService.applyLeave(leaveRequestDto);

        assertNotNull(result);
        assertEquals("Test Employee", result.getEmployeeName());
        assertEquals(LeaveStatus.PENDING, result.getStatus());
        assertEquals(6, result.getTotalDays());
        verify(leaveRepository, times(1)).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeaveInsufficientBalance() {
        LeaveRequestDto largeLeaveRequest = new LeaveRequestDto();
        largeLeaveRequest.setStartDate(LocalDate.now().plusDays(5));
        largeLeaveRequest.setEndDate(LocalDate.now().plusDays(15));
        largeLeaveRequest.setReason("Extended leave");
        largeLeaveRequest.setLeaveType(LeaveType.CASUAL);

        LeavePolicy casualPolicy = LeavePolicy.builder()
                .id(2L)
                .company(company)
                .leaveType(LeaveType.CASUAL)
                .totalLeaves(3)
                .active(true)
                .build();

        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leavePolicyRepository.findByCompanyIdAndLeaveTypeAndActiveTrue(company.getId(), LeaveType.CASUAL))
                .thenReturn(Optional.of(casualPolicy));
        doThrow(new BadRequestException("Insufficient CASUAL leave balance."))
                .when(employeeLeaveBalanceService)
                .assertSufficientBalance(eq(employee), eq(LeaveType.CASUAL), anyLong());

        assertThrows(BadRequestException.class, () -> leaveService.applyLeave(largeLeaveRequest));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeavePolicyNotActive() {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setStartDate(LocalDate.now().plusDays(5));
        dto.setEndDate(LocalDate.now().plusDays(6));
        dto.setReason("No policy");
        dto.setLeaveType(LeaveType.MATERNITY);

        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leavePolicyRepository.findByCompanyIdAndLeaveTypeAndActiveTrue(company.getId(), LeaveType.MATERNITY))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> leaveService.applyLeave(dto));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeavePastDate() {
        LeaveRequestDto pastLeaveRequest = new LeaveRequestDto();
        pastLeaveRequest.setStartDate(LocalDate.now().minusDays(5));
        pastLeaveRequest.setEndDate(LocalDate.now().minusDays(1));
        pastLeaveRequest.setReason("Past leave");
        pastLeaveRequest.setLeaveType(LeaveType.CASUAL);

        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));

        assertThrows(RuntimeException.class, () -> leaveService.applyLeave(pastLeaveRequest));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeaveStartDateAfterEndDate() {
        LeaveRequestDto invalidLeaveRequest = new LeaveRequestDto();
        invalidLeaveRequest.setStartDate(LocalDate.now().plusDays(15));
        invalidLeaveRequest.setEndDate(LocalDate.now().plusDays(10));
        invalidLeaveRequest.setReason("Invalid dates");
        invalidLeaveRequest.setLeaveType(LeaveType.CASUAL);

        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));

        assertThrows(RuntimeException.class, () -> leaveService.applyLeave(invalidLeaveRequest));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeaveOverlappingLeave() {
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leavePolicyRepository.findByCompanyIdAndLeaveTypeAndActiveTrue(company.getId(), LeaveType.SICK))
                .thenReturn(Optional.of(sickPolicy));
        when(leaveRepository.existsByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                employee, leaveRequestDto.getEndDate(), leaveRequestDto.getStartDate())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> leaveService.applyLeave(leaveRequestDto));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testApplyLeaveEmployeeNotFound() {
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> leaveService.applyLeave(leaveRequestDto));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testGetMyLeaves() {
        List<LeaveRequest> leaves = List.of(leaveRequest);
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leaveRepository.findByEmployee(employee)).thenReturn(leaves);

        List<LeaveResponseDto> result = leaveService.getMyLeaves();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Employee", result.get(0).getEmployeeName());
        verify(leaveRepository, times(1)).findByEmployee(employee);
    }

    @Test
    void testGetAllLeaves() {
        List<LeaveRequest> leaves = List.of(leaveRequest);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(leaveRepository.findByEmployeeCompany(company)).thenReturn(leaves);

        List<LeaveResponseDto> result = leaveService.getAllLeaves();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(leaveRepository, times(1)).findByEmployeeCompany(company);
    }

    @Test
    void testGetLeaveById() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(leaveRepository.findByIdAndEmployeeCompany(1L, company)).thenReturn(Optional.of(leaveRequest));

        LeaveResponseDto result = leaveService.getLeaveById(1L);

        assertNotNull(result);
        assertEquals("Test Employee", result.getEmployeeName());
        verify(leaveRepository, times(1)).findByIdAndEmployeeCompany(1L, company);
    }

    @Test
    void testGetLeaveByIdNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(leaveRepository.findByIdAndEmployeeCompany(999L, company)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> leaveService.getLeaveById(999L));
    }

    @Test
    void testCancelLeaveSuccess() {
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));
        leaveRequest.setEmployee(employee);

        String result = leaveService.cancelLeave(1L);

        assertEquals("Leave cancelled successfully.", result);
        assertEquals(LeaveStatus.CANCELLED, leaveRequest.getStatus());
        verify(leaveRepository, times(1)).save(leaveRequest);
        verify(employeeLeaveBalanceService, never()).restoreBalance(any(), any(), anyLong());
    }

    @Test
    void testCancelFutureApprovedLeaveRestoresBalance() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setEmployee(employee);
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        String result = leaveService.cancelLeave(1L);

        assertEquals("Leave cancelled successfully.", result);
        assertEquals(LeaveStatus.CANCELLED, leaveRequest.getStatus());
        verify(employeeLeaveBalanceService, times(1))
                .restoreBalance(eq(employee), eq(LeaveType.SICK), anyLong());
        verify(leaveRepository, times(1)).save(leaveRequest);
    }

    @Test
    void testCancelPastApprovedLeaveNotAllowed() {
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setStartDate(LocalDate.now().minusDays(10));
        leaveRequest.setEndDate(LocalDate.now().minusDays(5));
        leaveRequest.setEmployee(employee);
        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> leaveService.cancelLeave(1L));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void testCancelLeaveNotOwnLeave() {
        Employee anotherEmployee = Employee.builder()
                .id(2L)
                .fullName("Another Employee")
                .build();
        leaveRequest.setEmployee(anotherEmployee);

        when(employeeRepository.findByUserUsername("testuser")).thenReturn(Optional.of(employee));
        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leaveRequest));

        assertThrows(RuntimeException.class, () -> leaveService.cancelLeave(1L));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }
}
