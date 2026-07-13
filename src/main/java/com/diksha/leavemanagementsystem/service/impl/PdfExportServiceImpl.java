package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.service.PdfExportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class PdfExportServiceImpl implements PdfExportService {

    private static final DateTimeFormatter GENERATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private static final Font COMPANY_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(60, 60, 60));
    private static final Font META_FONT = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new Color(110, 110, 110));
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

    private static final Color HEADER_BACKGROUND = new Color(84, 110, 122);

    @Override
    public byte[] export(String companyName, String reportTitle, List<String> headers, List<List<String>> rows) {

        // Landscape A4 fits wider tables (e.g. the 10-column leave report)
        // more comfortably than portrait.
        Document document = new Document(PageSize.A4.rotate(), 24, 24, 36, 36);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph(companyName, COMPANY_FONT));
            document.add(new Paragraph(reportTitle, TITLE_FONT));
            document.add(new Paragraph(
                    "Generated on: " + LocalDateTime.now().format(GENERATED_AT_FORMAT), META_FONT));

            Paragraph spacer = new Paragraph(" ");
            spacer.setSpacingAfter(8);
            document.add(spacer);

            PdfPTable table = new PdfPTable(headers.size());
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
                cell.setBackgroundColor(HEADER_BACKGROUND);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(5);
                table.addCell(cell);
            }

            for (List<String> rowData : rows) {
                for (String value : rowData) {
                    PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, BODY_FONT));
                    cell.setPadding(4);
                    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    table.addCell(cell);
                }
            }

            if (rows.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No records found for the selected filters.", BODY_FONT));
                emptyCell.setColspan(headers.size());
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(10);
                table.addCell(emptyCell);
            }

            document.add(table);
            document.close();

            log.info("PDF export '{}' generated with {} data row(s) for company '{}'",
                    reportTitle, rows.size(), companyName);

            return out.toByteArray();

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
