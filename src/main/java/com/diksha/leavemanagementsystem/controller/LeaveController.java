package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.LeaveRequestDto;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.LeaveResponseDto;
import com.diksha.leavemanagementsystem.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // Apply Leave
    @PostMapping("/apply")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ApiResponse<LeaveResponseDto> applyLeave(
            @Valid @RequestBody LeaveRequestDto dto) {

        return new ApiResponse<>(
                true,
                "Leave applied successfully",
                leaveService.applyLeave(dto)
        );
    }

    // My Leaves
    @GetMapping("/my-leaves")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ApiResponse<List<LeaveResponseDto>> myLeaves() {

        return new ApiResponse<>(
                true,
                "Leaves fetched successfully",
                leaveService.getMyLeaves()
        );
    }

    // Get Leave by Id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<LeaveResponseDto> getLeaveById(
            @PathVariable Long id) {

        return new ApiResponse<>(
                true,
                "Leave fetched successfully",
                leaveService.getLeaveById(id)
        );
    }

    // Manager - View All Leaves
    @GetMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<LeaveResponseDto>> getAllLeaves() {

        return new ApiResponse<>(
                true,
                "All leaves fetched successfully",
                leaveService.getAllLeaves()
        );
    }

}