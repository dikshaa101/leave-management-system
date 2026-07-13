package com.diksha.leavemanagementsystem.service;

import java.util.List;

/**
 * Renders tabular data to a formatted PDF (company name, report title,
 * generated timestamp, bordered table). Format-agnostic with respect to
 * report type.
 */
public interface PdfExportService {

    /**
     * @param companyName the manager's company, shown in the report header
     * @param reportTitle e.g. "Holiday List"
     * @param headers     column headers, in order
     * @param rows        each inner list is one row, values in the same order as {@code headers}
     * @return the PDF file bytes
     */
    byte[] export(String companyName, String reportTitle, List<String> headers, List<List<String>> rows);
}
