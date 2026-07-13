package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.LeavePolicyRequestDto;
import com.diksha.leavemanagementsystem.dto.request.LeavePolicyStatusUpdateDto;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.EmployeeLeaveBalanceResponseDto;
import com.diksha.leavemanagementsystem.dto.response.LeavePolicyResponseDto;
import com.diksha.leavemanagementsystem.service.EmployeeLeaveBalanceService;
import com.diksha.leavemanagementsystem.service.LeavePolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LeavePolicyController {

    private final LeavePolicyService leavePolicyService;
    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;

    /**
     * Manager - View all company leave policies (active + inactive)
     */
    @GetMapping("/manager/leave-policies")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<LeavePolicyResponseDto>> getManagerPolicies() {

        return new ApiResponse<>(
                true,
                "Leave policies fetched successfully.",
                leavePolicyService.getCompanyPolicies()
        );
    }

    /**
     * Manager - Create leave policy
     */
    @PostMapping("/manager/leave-policies")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<LeavePolicyResponseDto> createPolicy(
            @Valid @RequestBody LeavePolicyRequestDto dto) {

        return new ApiResponse<>(
                true,
                "Leave policy created successfully.",
                leavePolicyService.createPolicy(dto)
        );
    }

    /**
     * Manager - Update leave policy
     */
    @PutMapping("/manager/leave-policies/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<LeavePolicyResponseDto> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody LeavePolicyRequestDto dto) {

        return new ApiResponse<>(
                true,
                "Leave policy updated successfully.",
                leavePolicyService.updatePolicy(id, dto)
        );
    }

    /**
     * Manager - Activate/Deactivate leave policy
     */
    @PatchMapping("/manager/leave-policies/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<LeavePolicyResponseDto> updatePolicyStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeavePolicyStatusUpdateDto dto) {

        return new ApiResponse<>(
                true,
                dto.getActive()
                        ? "Leave policy activated successfully."
                        : "Leave policy deactivated successfully.",
                leavePolicyService.updateStatus(id, dto.getActive())
        );
    }

    /**
     * Manager - Delete leave policy (only if unused)
     */
    @DeleteMapping("/manager/leave-policies/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> deletePolicy(@PathVariable Long id) {

        leavePolicyService.deletePolicy(id);

        return new ApiResponse<>(
                true,
                "Leave policy deleted successfully.",
                null
        );
    }

    /**
     * Employee - View active company leave policies
     */
    @GetMapping("/employee/leave-policies")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<List<LeavePolicyResponseDto>> getEmployeePolicies() {

        return new ApiResponse<>(
                true,
                "Leave policies fetched successfully.",
                leavePolicyService.getActiveCompanyPolicies()
        );
    }

    /**
     * Employee - View my remaining balance for every leave type
     */
    @GetMapping("/employee/leave-balances")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<List<EmployeeLeaveBalanceResponseDto>> getMyBalances() {

        return new ApiResponse<>(
                true,
                "Leave balances fetched successfully.",
                employeeLeaveBalanceService.getMyBalances()
        );
    }
}
