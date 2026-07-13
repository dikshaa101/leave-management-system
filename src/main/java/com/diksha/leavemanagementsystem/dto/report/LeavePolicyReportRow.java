package com.diksha.leavemanagementsystem.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single flattened row of a company leave-policy report.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeavePolicyReportRow {

    private String leaveType;

    private int totalLeaves;

    private String description;

    private boolean active;
}
