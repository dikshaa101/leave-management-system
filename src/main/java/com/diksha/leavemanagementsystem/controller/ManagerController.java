package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.request.CreateEmployeeRequest;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.service.ApprovalService;
import com.diksha.leavemanagementsystem.service.EmployeeAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ApprovalService approvalService;
    private final EmployeeAccountService employeeAccountService;

    /**
     * Create Employee Account
     */
    @PostMapping("/employees")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<EmployeeResponseDto> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request) {

        EmployeeResponseDto employee =
                employeeAccountService.createEmployee(request);

        return new ApiResponse<>(
                true,
                "Employee account created successfully.",
                employee
        );
    }

    /**
     * View Pending Leave Requests
     */
    @GetMapping("/leaves/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<LeaveResponseDto>> getPendingLeaves() {

        return new ApiResponse<>(
                true,
                "Pending leave requests fetched successfully.",
                approvalService.getPendingLeaves()
        );
    }

    /**
     * Approve Leave
     */
    @PutMapping("/leaves/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> approveLeave(
            @PathVariable Long id,
            @RequestBody ApprovalRequestDto dto) {

        return new ApiResponse<>(
                true,
                approvalService.approveLeave(id, dto),
                null
        );
    }

    /**
     * Reject Leave
     */
    @PutMapping("/leaves/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> rejectLeave(
            @PathVariable Long id,
            @RequestBody ApprovalRequestDto dto) {

        return new ApiResponse<>(
                true,
                approvalService.rejectLeave(id, dto),
                null
        );
    }
}