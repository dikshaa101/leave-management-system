package com.diksha.leavemanagementsystem.controller;

import com.diksha.leavemanagementsystem.dto.report.EmployeeBalanceReportRow;
import com.diksha.leavemanagementsystem.dto.report.HolidayReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeavePolicyReportRow;
import com.diksha.leavemanagementsystem.dto.report.LeaveReportRow;
import com.diksha.leavemanagementsystem.dto.request.ReportFilterDto;
import com.diksha.leavemanagementsystem.service.CsvExportService;
import com.diksha.leavemanagementsystem.service.ExcelExportService;
import com.diksha.leavemanagementsystem.service.PdfExportService;
import com.diksha.leavemanagementsystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private static final MediaType XLSX_MEDIA_TYPE =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;
    private final CsvExportService csvExportService;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    private static final List<String> LEAVE_HEADERS = List.of(
            "Employee Name", "Department", "Leave Type", "Status",
            "Start Date", "End Date", "Total Days", "Reason", "Applied On", "Manager Remarks"
    );

    private static final List<String> BALANCE_HEADERS = List.of(
            "Employee Name", "Department", "Leave Type", "Total Allocated", "Remaining Balance", "Used"
    );

    private static final List<String> HOLIDAY_HEADERS = List.of(
            "Holiday Name", "Date", "Description", "Type"
    );

    private static final List<String> POLICY_HEADERS = List.of(
            "Leave Type", "Total Leaves", "Description", "Status"
    );

    @GetMapping("/manager/reports/leaves/csv")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportLeavesCsv(@ModelAttribute ReportFilterDto filter) {

        List<LeaveReportRow> rows = reportService.getLeaveReport(filter);
        List<List<String>> data = rows.stream().map(this::toLeaveRow).toList();

        byte[] content = csvExportService.export(LEAVE_HEADERS, data);

        return downloadResponse(content, MediaType.parseMediaType("text/csv; charset=UTF-8"), "leave-requests-report.csv");
    }

    @GetMapping("/manager/reports/leaves/excel")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportLeavesExcel(@ModelAttribute ReportFilterDto filter) {

        List<LeaveReportRow> rows = reportService.getLeaveReport(filter);
        List<List<String>> data = rows.stream().map(this::toLeaveRow).toList();

        byte[] content = excelExportService.export(
                reportService.getLoggedInCompanyName(),
                buildLeaveReportTitle(filter),
                LEAVE_HEADERS,
                data);

        return downloadResponse(content, XLSX_MEDIA_TYPE, "leave-requests-report.xlsx");
    }

    @GetMapping("/manager/reports/leaves/pdf")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportLeavesPdf(@ModelAttribute ReportFilterDto filter) {

        List<LeaveReportRow> rows = reportService.getLeaveReport(filter);
        List<List<String>> data = rows.stream().map(this::toLeaveRow).toList();

        byte[] content = pdfExportService.export(
                reportService.getLoggedInCompanyName(),
                buildLeaveReportTitle(filter),
                LEAVE_HEADERS,
                data);

        return downloadResponse(content, MediaType.APPLICATION_PDF, "leave-requests-report.pdf");
    }

    @GetMapping("/manager/reports/balances/excel")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportBalancesExcel(@ModelAttribute ReportFilterDto filter) {

        List<EmployeeBalanceReportRow> rows = reportService.getBalanceReport(filter);

        List<List<String>> data = rows.stream()
                .map(row -> List.of(
                        row.getEmployeeName(),
                        row.getDepartment(),
                        row.getLeaveType(),
                        String.valueOf(row.getTotalAllocated()),
                        String.valueOf(row.getRemainingBalance()),
                        String.valueOf(row.getUsedLeaves())
                ))
                .toList();

        byte[] content = excelExportService.export(
                reportService.getLoggedInCompanyName(),
                "Employee Leave Balance Report",
                BALANCE_HEADERS,
                data);

        return downloadResponse(content, XLSX_MEDIA_TYPE, "leave-balance-report.xlsx");
    }

    @GetMapping("/manager/reports/holidays/pdf")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportHolidaysPdf() {

        List<HolidayReportRow> rows = reportService.getHolidayReport();

        List<List<String>> data = rows.stream()
                .map(row -> List.of(
                        row.getHolidayName(),
                        row.getHolidayDate() != null ? row.getHolidayDate().toString() : "",
                        row.getDescription() == null ? "" : row.getDescription(),
                        row.isOptionalHoliday() ? "Optional" : "Mandatory"
                ))
                .toList();

        byte[] content = pdfExportService.export(
                reportService.getLoggedInCompanyName(),
                "Holiday List",
                HOLIDAY_HEADERS,
                data);

        return downloadResponse(content, MediaType.APPLICATION_PDF, "holiday-list.pdf");
    }

    @GetMapping("/manager/reports/policies/pdf")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<byte[]> exportPoliciesPdf() {

        List<LeavePolicyReportRow> rows = reportService.getPolicyReport();

        List<List<String>> data = rows.stream()
                .map(row -> List.of(
                        row.getLeaveType(),
                        String.valueOf(row.getTotalLeaves()),
                        row.getDescription() == null ? "" : row.getDescription(),
                        row.isActive() ? "Active" : "Inactive"
                ))
                .toList();

        byte[] content = pdfExportService.export(
                reportService.getLoggedInCompanyName(),
                "Leave Policy Report",
                POLICY_HEADERS,
                data);

        return downloadResponse(content, MediaType.APPLICATION_PDF, "leave-policy-report.pdf");
    }

    private List<String> toLeaveRow(LeaveReportRow row) {
        return List.of(
                row.getEmployeeName(),
                row.getDepartment(),
                row.getLeaveType(),
                row.getStatus(),
                formatDate(row.getStartDate()),
                formatDate(row.getEndDate()),
                String.valueOf(row.getTotalDays()),
                row.getReason() == null ? "" : row.getReason(),
                formatDate(row.getAppliedOn()),
                row.getManagerRemarks() == null ? "" : row.getManagerRemarks()
        );
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.toString();
    }

    private String buildLeaveReportTitle(ReportFilterDto filter) {
        if (filter != null && filter.getStatus() != null) {
            return filter.getStatus().name() + " Leave Requests Report";
        }
        return "All Leave Requests Report";
    }

    private ResponseEntity<byte[]> downloadResponse(byte[] content, MediaType mediaType, String filename) {

        log.info("Serving report download '{}' ({} bytes)", filename, content.length);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(content);
    }
}
