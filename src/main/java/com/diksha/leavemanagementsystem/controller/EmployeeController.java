package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.request.EmployeeRequestDto;
import com.diksha.leavemanagementsystem.dto.response.ApiResponse;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<EmployeeResponseDto> addEmployee(
            @Valid @RequestBody EmployeeRequestDto dto) {

        EmployeeResponseDto employee =
                employeeService.addEmployee(dto);

        return new ApiResponse<>(
                true,
                "Employee added successfully",
                employee
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<List<EmployeeResponseDto>> getAllEmployees() {

        return new ApiResponse<>(

                true,

                "Employee list fetched successfully",

                employeeService.getAllEmployees()

        );

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<EmployeeResponseDto> getEmployeeById(
            @PathVariable Long id) {

        return new ApiResponse<>(

                true,

                "Employee fetched successfully",

                employeeService.getEmployeeById(id)

        );

    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<EmployeeResponseDto> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeRequestDto dto){

        return new ApiResponse<>(

                true,

                "Employee updated successfully",

                employeeService.updateEmployee(id,dto)

        );

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> deleteEmployee(
            @PathVariable Long id){

        return new ApiResponse<>(

                true,

                employeeService.deleteEmployee(id),

                null

        );

    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<Page<EmployeeResponseDto>> searchDepartment(

            @RequestParam String department,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "5") int size){

        Pageable pageable = PageRequest.of(page,size);

        return new ApiResponse<>(

                true,

                "Department employees fetched",

                employeeService.searchByDepartment(
                        department,
                        pageable)

        );

    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<Page<EmployeeResponseDto>> getEmployees(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "5") int size,

            @RequestParam(defaultValue = "fullName") String sortBy){

        return new ApiResponse<>(

                true,

                "Employees fetched",

                employeeService.getEmployees(
                        page,
                        size,
                        sortBy)

        );

    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    public ApiResponse<EmployeeResponseDto> myProfile(){

        return new ApiResponse<>(

                true,

                "Profile fetched",

                employeeService.getMyProfile()

        );

    }





}