package com.diksha.leavemanagementsystem.service.impl;

import com.diksha.leavemanagementsystem.service.CsvExportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Slf4j
public class CsvExportServiceImpl implements CsvExportService {

    private static final byte[] UTF8_BOM = { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };

    @Override
    public byte[] export(List<String> headers, List<List<String>> rows) {

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // UTF-8 BOM so Excel (and other spreadsheet tools) correctly
            // detect the encoding instead of guessing the system default.
            out.write(UTF8_BOM);

            out.write(toCsvLine(headers).getBytes(StandardCharsets.UTF_8));

            for (List<String> row : rows) {
                out.write(toCsvLine(row).getBytes(StandardCharsets.UTF_8));
            }

            log.info("CSV export generated with {} data row(s)", rows.size());

            return out.toByteArray();

        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate CSV report", e);
        }
    }

    private String toCsvLine(List<String> values) {
        StringBuilder line = new StringBuilder();

        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                line.append(',');
            }
            line.append(escapeCsvValue(values.get(i)));
        }

        line.append("\r\n");
        return line.toString();
    }

    private String escapeCsvValue(String value) {
        if (value == null) {
            return "";
        }

        boolean needsQuoting = value.contains(",") || value.contains("\"")
                || value.contains("\n") || value.contains("\r");

        if (!needsQuoting) {
            return value;
        }

        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
