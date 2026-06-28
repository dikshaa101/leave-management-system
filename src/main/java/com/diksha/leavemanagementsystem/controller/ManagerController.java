package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.ApprovalRequestDto;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ApprovalService approvalService;

    // View all pending leave requests
    @GetMapping("/leaves/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<LeaveResponseDto>> getPendingLeaves() {

        return new ApiResponse<>(
                true,
                "Pending leave requests fetched successfully.",
                approvalService.getPendingLeaves()
        );
    }

    // Approve leave request
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

    // Reject leave request
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