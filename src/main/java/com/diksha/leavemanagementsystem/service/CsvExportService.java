package com.diksha.leavemanagementsystem.service;

import java.util.List;

/**
 * Renders tabular data to CSV. Format-agnostic with respect to report
 * type — callers supply the column headers and row data, so the same
 * renderer serves every report.
 */
public interface CsvExportService {

    /**
     * @param headers column headers, in order
     * @param rows    each inner list is one row, values in the same order as {@code headers}
     * @return UTF-8 encoded CSV bytes, header row first
     */
    byte[] export(List<String> headers, List<List<String>> rows);
}
