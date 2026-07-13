package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.service.ExcelExportService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class ExcelExportServiceImpl implements ExcelExportService {

    private static final DateTimeFormatter GENERATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Override
    public byte[] export(String companyName, String reportTitle, List<String> headers, List<List<String>> rows) {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Report");

            CellStyle companyStyle = buildCompanyStyle(workbook);
            CellStyle titleStyle = buildTitleStyle(workbook);
            CellStyle metaStyle = buildMetaStyle(workbook);
            CellStyle headerStyle = buildHeaderStyle(workbook);
            CellStyle bodyStyle = buildBodyStyle(workbook);

            int rowIndex = 0;

            rowIndex = writeStyledLine(sheet, rowIndex, companyName, companyStyle);
            rowIndex = writeStyledLine(sheet, rowIndex, reportTitle, titleStyle);
            rowIndex = writeStyledLine(sheet, rowIndex,
                    "Generated on: " + LocalDateTime.now().format(GENERATED_AT_FORMAT), metaStyle);
            rowIndex++; // blank spacer row

            Row headerRow = sheet.createRow(rowIndex++);
            for (int col = 0; col < headers.size(); col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers.get(col));
                cell.setCellStyle(headerStyle);
            }

            for (List<String> rowData : rows) {
                Row row = sheet.createRow(rowIndex++);
                for (int col = 0; col < rowData.size(); col++) {
                    Cell cell = row.createCell(col);
                    cell.setCellValue(rowData.get(col) == null ? "" : rowData.get(col));
                    cell.setCellStyle(bodyStyle);
                }
            }

            for (int col = 0; col < headers.size(); col++) {
                sheet.autoSizeColumn(col);
                // autoSizeColumn under-estimates for bold header text; pad a little.
                sheet.setColumnWidth(col, sheet.getColumnWidth(col) + 1024);
            }

            workbook.write(out);

            log.info("Excel export '{}' generated with {} data row(s) for company '{}'",
                    reportTitle, rows.size(), companyName);

            return out.toByteArray();

        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate Excel report", e);
        }
    }

    private int writeStyledLine(Sheet sheet, int rowIndex, String value, CellStyle style) {
        Row row = sheet.createRow(rowIndex);
        Cell cell = row.createCell(0);
        cell.setCellValue(value);
        cell.setCellStyle(style);
        return rowIndex + 1;
    }

    private CellStyle buildCompanyStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    private CellStyle buildTitleStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    private CellStyle buildMetaStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 10);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    private CellStyle buildHeaderStyle(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        applyThinBorder(style);
        return style;
    }

    private CellStyle buildBodyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        applyThinBorder(style);
        return style;
    }

    private void applyThinBorder(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
