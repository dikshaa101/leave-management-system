package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.request.EmployeeRequestDto;
import com.diksha.leavemanagementsystem.dto.response.EmployeeResponseDto;
import com.diksha.leavemanagementsystem.entity.Employee;
import com.diksha.leavemanagementsystem.exception.ResourceNotFoundException;
import com.diksha.leavemanagementsystem.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import org.springframework.security.core.Authentication;


import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeResponseDto addEmployee(EmployeeRequestDto dto) {

        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Employee already exists with this email");
        }

        Employee employee = mapToEntity(dto);

        Employee savedEmployee = employeeRepository.save(employee);

        return mapToDto(savedEmployee);
    }

    public List<EmployeeResponseDto> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public EmployeeResponseDto getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found with id : " + id));

        return mapToDto(employee);
    }

    private Employee mapToEntity(EmployeeRequestDto dto) {

        return Employee.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate())
                .leaveBalance(20)
                .build();

    }

    private EmployeeResponseDto mapToDto(Employee employee) {

        return EmployeeResponseDto.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .joiningDate(employee.getJoiningDate())
                .leaveBalance(employee.getLeaveBalance())
                .build();

    }

    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto dto){

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        employee.setFullName(dto.getFullName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());

        return mapToDto(employeeRepository.save(employee));

    }

    public String deleteEmployee(Long id){

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        employeeRepository.delete(employee);

        return "Employee deleted successfully";

    }

    public Page<EmployeeResponseDto> searchByDepartment(
            String department,
            Pageable pageable){

        return employeeRepository

                .findByDepartmentContainingIgnoreCase(
                        department,
                        pageable)

                .map(this::mapToDto);

    }

    public Page<EmployeeResponseDto> getEmployees(
            int page,
            int size,
            String sortBy){

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sortBy));

        return employeeRepository.findAll(pageable)
                .map(this::mapToDto);

    }

    public EmployeeResponseDto getMyProfile(){

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username = authentication.getName();

        Employee employee =
                employeeRepository
                        .findByUserUsername(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Employee not found"));

        return mapToDto(employee);

    }



}
