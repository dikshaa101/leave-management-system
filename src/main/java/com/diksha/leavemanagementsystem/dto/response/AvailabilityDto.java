package com.diksha.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AvailabilityDto {

    private int totalEmployees;

    private int availableEmployees;

    private int employeesOnLeave;

    private List<String> availableEmployeeNames;

    private List<String> employeesOnLeaveNames;

}