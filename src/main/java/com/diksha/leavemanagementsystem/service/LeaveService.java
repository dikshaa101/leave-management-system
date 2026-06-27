package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.LeaveRequestDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.entity.LeaveRequest;
import com.diksha.leavemanagementsystem.entity.LeaveStatus;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import com.diksha.leavemanagementsystem.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
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

    public LeaveResponseDto applyLeave(LeaveRequestDto dto) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        Employee employee = employeeRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        if(dto.getStartDate().isAfter(dto.getEndDate())){

            throw new RuntimeException(
                    "Start date cannot be after end date");
        }

        if(dto.getStartDate().isBefore(LocalDate.now())){

            throw new RuntimeException(
                    "Leave cannot be applied for past dates");
        }

        boolean overlap = leaveRepository
                .existsByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        employee,
                        dto.getEndDate(),
                        dto.getStartDate()
                );

        if(overlap){

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

        return mapToDto(
                leaveRepository.save(leave)
        );

    }

    public List<LeaveResponseDto> getMyLeaves(){

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        Employee employee = employeeRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        return leaveRepository.findByEmployee(employee)
                .stream()
                .map(this::mapToDto)
                .toList();

    }

    public List<LeaveResponseDto> getAllLeaves(){

        return leaveRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();

    }

    public LeaveResponseDto getLeaveById(Long id){

        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave not found"));

        return mapToDto(leave);

    }

    private LeaveResponseDto mapToDto(LeaveRequest leave){

        return LeaveResponseDto.builder()
                .id(leave.getId())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .leaveType(leave.getLeaveType())
                .status(leave.getStatus())
                .appliedOn(leave.getAppliedOn())
                .employeeName(
                        leave.getEmployee().getFullName()
                )
                .build();

    }
    public String cancelLeave(Long leaveId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        Employee employee = employeeRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leave not found"));

        // Employee can cancel only their own leave
        if (!leave.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("You can cancel only your own leave requests.");
        }

        // Only pending leave can be cancelled
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be cancelled.");
        }

        leave.setStatus(LeaveStatus.CANCELLED);

        leaveRepository.save(leave);

        return "Leave cancelled successfully.";

    }

}