package com.diksha.leavemanagementsystem.service;

import com.diksha.leavemanagementsystem.dto.report.EmployeeBalanceReportRow;
import com.diksha.leavemanagementsystem.dto.report.HolidayReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeavePolicyReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeaveReportRow;
import com.diksha.leavemanagementsystem.dto.request.ReportFilterDto;

import java.util.List;

/**
 * Fetches company-scoped, filtered report data for the logged-in manager.
 * Every method here is strictly isolated to the logged-in manager's own
 * company — there is no way to request another company's data through
 * this service.
 */
public interface ReportService {

    /**
     * The logged-in manager's company name, used in report headers.
     */
    String getLoggedInCompanyName();

    List<LeaveReportRow> getLeaveReport(ReportFilterDto filter);

    List<EmployeeBalanceReportRow> getBalanceReport(ReportFilterDto filter);

    List<HolidayReportRow> getHolidayReport();

    List<LeavePolicyReportRow> getPolicyReport();
}
