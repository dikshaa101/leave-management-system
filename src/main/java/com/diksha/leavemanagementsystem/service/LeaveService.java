package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LeaveRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.Company;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.entity.Role;
import com.diksha.leavemanagementsystem.entity.User;
import com.diksha.leavemanagementsystem.event.LeaveAppliedEvent;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import com.diksha.leavemanagementsystem.repository.UserRepository;
import com.diksha.leavemanagementsystem.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final HolidayService holidayService;

    /**
     * Returns logged-in user's company.
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
     * Returns logged-in employee.
     */
    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));
    }

    public LeaveResponseDto applyLeave(LeaveRequestDto dto) {

        Employee employee = getLoggedInEmployee();

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        if (dto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Leave cannot be applied for past dates");
        }

        long leaveDays = calculateLeaveDays(
                employee.getCompany(),
                dto.getStartDate(),
                dto.getEndDate());

        if (leaveDays > employee.getLeaveBalance()) {
            throw new RuntimeException(
                    "Insufficient leave balance. Available: "
                            + employee.getLeaveBalance() + " days");
        }

        boolean overlap =
                leaveRepository.existsByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        employee,
                        dto.getEndDate(),
                        dto.getStartDate());

        if (overlap) {
            throw new RuntimeException(
                    "Leave already exists for selected dates");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .leaveType(dto.getLeaveType())
                .status(LeaveStatus.PENDING)
                .appliedOn(LocalDate.now())
                .employee(employee)
                .build();

        LeaveRequest savedLeave = leaveRepository.save(leave);

        notifyManagers(employee, savedLeave, leaveDays);

        return mapToDto(savedLeave);
    }

    /**
     * Notifies every manager of the applicant's company that a new leave
     * request is awaiting review. Failure to resolve/notify managers never
     * affects the leave application itself — it has already been saved.
     */
    private void notifyManagers(Employee employee, LeaveRequest savedLeave, long leaveDays) {

        List<Employee> managers = employeeRepository
                .findByCompanyIdAndUserRole(employee.getCompany().getId(), Role.MANAGER);

        managers.forEach(manager -> {
            if (manager.getEmail() == null || manager.getEmail().isBlank()) {
                return;
            }

            eventPublisher.publishEvent(
                    LeaveAppliedEvent.builder()
                            .recipientEmail(manager.getEmail())
                            .managerName(manager.getFullName())
                            .employeeName(employee.getFullName())
                            .leaveType(savedLeave.getLeaveType().name())
                            .startDate(savedLeave.getStartDate())
                            .endDate(savedLeave.getEndDate())
                            .totalDays(leaveDays)
                            .reason(savedLeave.getReason())
                            .appliedOn(savedLeave.getAppliedOn())
                            .build()
            );
        });
    }

    public List<LeaveResponseDto> getMyLeaves() {

        Employee employee = getLoggedInEmployee();

        return leaveRepository.findByEmployee(employee)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Managers can view only leave requests
     * belonging to their company.
     */
    public List<LeaveResponseDto> getAllLeaves() {

        Company company = getLoggedInCompany();

        return leaveRepository
                .findByEmployeeCompany(company)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Fetch leave only if it belongs
     * to logged-in user's company.
     */
    public LeaveResponseDto getLeaveById(Long id) {

        Company company = getLoggedInCompany();

        LeaveRequest leave =
                leaveRepository
                        .findByIdAndEmployeeCompany(id, company)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Leave not found"));

        return mapToDto(leave);
    }

    public String cancelLeave(Long leaveId) {

        Employee employee = getLoggedInEmployee();

        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave not found"));

        if (!leave.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException(
                    "You can cancel only your own leave requests.");
        }

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending leave requests can be cancelled.");
        }

        leave.setStatus(LeaveStatus.CANCELLED);

        leaveRepository.save(leave);

        return "Leave cancelled successfully.";
    }

    public LeaveResponseDto mapToDto(LeaveRequest leave) {

        return LeaveResponseDto.builder()
                .id(leave.getId())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .leaveType(leave.getLeaveType())
                .status(leave.getStatus())
                .appliedOn(leave.getAppliedOn())
                .employeeName(leave.getEmployee().getFullName())
                .totalDays(calculateLeaveDays(
                        leave.getEmployee().getCompany(),
                        leave.getStartDate(),
                        leave.getEndDate()))
                .managerRemarks(leave.getManagerRemarks())
                .actionDate(leave.getActionDate())
                .build();
    }

    /**
     * Calculates leave days inclusive of start/end date, excluding any
     * company holidays that fall within the range. E.g. 22-26 Dec with
     * 25 Dec marked as a holiday resolves to 4 days, not 5.
     */
    long calculateLeaveDays(Company company,
                             LocalDate startDate,
                             LocalDate endDate) {

        var holidayDates =
                holidayService.getHolidayDatesInRange(company, startDate, endDate);

        return DateUtils.calculateLeaveDays(startDate, endDate, holidayDates);
    }

}