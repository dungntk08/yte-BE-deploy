package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sk.ytr.modules.dto.excel.IndicatorHeaderMeta;
import sk.ytr.modules.service.ExcelService;

import java.io.ByteArrayInputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-results")
@RequiredArgsConstructor
@Slf4j
public class MedicalResultExcelController {

    private final ExcelService excelService;

    /**
     * Export danh sách kết quả khám sức khỏe học sinh ra file Excel
     *
     * @param campaignId ID đợt khám
     */
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportExcel(
            @RequestParam Long campaignId
    ) {

        ByteArrayInputStream excelStream =
                excelService.exportExcel(campaignId);

        String fileName = "ket-qua-kham-suc-khoe-campaign-" + campaignId + ".xlsx";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(new InputStreamResource(excelStream));
    }

    @PostMapping(
            value = "/import-excel/{campaignId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> importExcel(
            @PathVariable Long campaignId,
            @RequestPart("file") MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("File Excel không được để trống");
        }

        String filename = file.getOriginalFilename();
        if (filename == null ||
                !(filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            return ResponseEntity.badRequest()
                    .body("File không đúng định dạng Excel (.xlsx, .xls)");
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            // Parse header → build meta map
            Map<Integer, IndicatorHeaderMeta> headerMetaMap =
                    excelService.parseIndicatorHeader(sheet, campaignId);

            //  Import
            excelService.importExcel(file, campaignId, headerMetaMap);

            return ResponseEntity.ok("Import kết quả khám thành công");

        } catch (Exception e) {
            log.error("Lỗi import Excel", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Import thất bại: " + e.getMessage());
        }
    }
}