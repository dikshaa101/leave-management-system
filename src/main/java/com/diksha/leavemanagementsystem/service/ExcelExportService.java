package com.diksha.leavemanagementsystem.service;

import java.util.List;

/**
 * Renders tabular data to a formatted .xlsx workbook (company name,
 * report title, generated timestamp, styled header row, auto-sized
 * columns). Format-agnostic with respect to report type.
 */
public interface ExcelExportService {

    /**
     * @param companyName the manager's company, shown in the report header
     * @param reportTitle e.g. "All Leave Requests Report"
     * @param headers     column headers, in order
     * @param rows        each inner list is one row, values in the same order as {@code headers}
     * @return the .xlsx file bytes
     */
    byte[] export(String companyName, String reportTitle, List<String> headers, List<List<String>> rows);
}
