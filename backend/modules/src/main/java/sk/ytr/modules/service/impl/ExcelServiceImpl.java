package sk.ytr.modules.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sk.ytr.modules.constant.GenderTypeEnum;
import sk.ytr.modules.dto.excel.ExcelMedicalColumn;
import sk.ytr.modules.dto.excel.IndicatorHeaderMeta;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.ExcelService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class ExcelServiceImpl implements ExcelService {

    private final StudentRepository studentRepository;
    private final MedicalResultDetailRepository medicalResultDetailRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;
    private final CampaignMedicalConfigSubRepository campaignMedicalConfigSubRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    private final MedicalGroupRepository medicalGroupRepository;

    /**
     * Tạo header Excel 3 dòng:
     * - Dòng 0: Nhóm khám
     * - Dòng 1: Chỉ tiêu
     * - Dòng 2: Chỉ tiêu con
     *
     * @param workbook       Workbook Apache POI
     * @param sheet          Sheet cần tạo header
     * @param dynamicColumns Danh sách cột động theo cấu hình khám
     * @return index cột bắt đầu ghi data
     */
    @Override
    public Integer buildHeader(
            Workbook workbook,
            Sheet sheet,
            List<ExcelMedicalColumn> dynamicColumns
    ) {

        // =========================
        // STYLE
        // =========================
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setWrapText(true);

        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        headerStyle.setFont(font);

        // =========================
        // ROWS
        // =========================
        Row groupRow = sheet.createRow(0);
        Row indicatorRow = sheet.createRow(1);
        Row subIndicatorRow = sheet.createRow(2);

        // =========================
        // FIXED COLUMNS
        // =========================
        String[] fixedHeaders = {
                "STT",
                "Họ và tên học sinh",
                "Ngày tháng năm sinh",
                "Nam",
                "Nữ",
                "Địa chỉ",
                "Mã định danh / CCCD",
                "Cân nặng (kg)",
                "Chiều cao (cm)",
                "TB KQ về gia đình"
        };

        int colIndex = 0;

        for (String header : fixedHeaders) {
            sheet.addMergedRegion(
                    new CellRangeAddress(0, 2, colIndex, colIndex)
            );

            Cell cell = groupRow.createCell(colIndex);
            cell.setCellValue(header);
            cell.setCellStyle(headerStyle);

            colIndex++;
        }

        int dynamicStartCol = colIndex;

        // =========================
        // DYNAMIC COLUMNS
        // =========================
        for (ExcelMedicalColumn col : dynamicColumns) {

            int c = col.getColumnIndex();

            // ---- GROUP
            Cell groupCell = groupRow.createCell(c);
            groupCell.setCellValue(col.getMedicalGroupName());
            groupCell.setCellStyle(headerStyle);

            // ---- INDICATOR
            Cell indicatorCell = indicatorRow.createCell(c);
            indicatorCell.setCellValue(col.getIndicatorName());
            indicatorCell.setCellStyle(headerStyle);

            // ---- SUB INDICATOR
            Cell subCell = subIndicatorRow.createCell(c);
            if (col.getSubIndicatorName() != null) {
                subCell.setCellValue(col.getSubIndicatorName());
            }
            subCell.setCellStyle(headerStyle);
        }

        int dynamicEndCol = dynamicColumns.stream()
                .mapToInt(ExcelMedicalColumn::getColumnIndex)
                .max()
                .orElse(dynamicStartCol);

        // =========================
        // MERGE GROUP ROW
        // =========================
        mergeSameCell(sheet, groupRow, 0, dynamicStartCol, dynamicEndCol);

        // =========================
        // MERGE INDICATOR ROW
        // =========================
        mergeSameCell(sheet, indicatorRow, 1, dynamicStartCol, dynamicEndCol);

        // =========================
        // MERGE INDICATOR WITHOUT SUB
        // =========================
        for (ExcelMedicalColumn col : dynamicColumns) {
            if (col.getSubIndicatorName() == null) {
                sheet.addMergedRegion(
                        new CellRangeAddress(
                                1, 2,
                                col.getColumnIndex(),
                                col.getColumnIndex()
                        )
                );
            }
        }

        // =========================
        // AUTO SIZE
        // =========================
        for (int i = 0; i <= dynamicEndCol; i++) {
            sheet.autoSizeColumn(i);
        }

        return dynamicEndCol + 1;
    }

    /**
     * Merge các cell liền nhau có cùng giá trị
     */
    private void mergeSameCell(
            Sheet sheet,
            Row row,
            int rowIndex,
            int startCol,
            int endCol
    ) {

        int mergeStart = startCol;
        String lastValue = null;

        for (int i = startCol; i <= endCol; i++) {
            Cell cell = row.getCell(i);
            String value = cell != null ? cell.getStringCellValue() : "";

            if (lastValue == null) {
                lastValue = value;
                mergeStart = i;
                continue;
            }

            if (!value.equals(lastValue)) {
                if (mergeStart < i - 1) {
                    sheet.addMergedRegion(
                            new CellRangeAddress(
                                    rowIndex, rowIndex,
                                    mergeStart, i - 1
                            )
                    );
                }
                mergeStart = i;
                lastValue = value;
            }
        }

        if (mergeStart < endCol) {
            sheet.addMergedRegion(
                    new CellRangeAddress(
                            rowIndex, rowIndex,
                            mergeStart, endCol
                    )
            );
        }
    }

    /**
     * Nhập dữ liệu từ file Excel và lưu các chi tiết kết quả khám.
     *
     * <p>Hành vi:
     * - Mở sheet đầu tiên của file Excel.
     * - Bỏ qua 3 dòng header đầu (dòng 0..2) và duyệt từng dòng dữ liệu từ dòng 3.
     * - Đọc mã học sinh từ cột 1 bằng {@link #getLongCellValue(Cell)}; nếu không có hoặc không hợp lệ thì bỏ qua dòng.
     * - Tìm {@link Student} theo mã; nếu không tìm thấy ném {@link RuntimeException}.
     * - Với mỗi cột động trong {@code headerMetaMap} đọc ô và chuyển thành giá trị boolean bằng {@link #parseBooleanCell(Cell)}.
     * - Nếu ô hợp lệ tạo {@link sk.ytr.modules.entity.MedicalResultDetail} và thu thập lại.
     * - Cuối cùng lưu danh sách kết quả hàng loạt bằng {@code medicalResultDetailRepository.saveAll(...)}.
     *
     * <p>Lưu ý:
     * - Bất kỳ ô trống hoặc không parse được sẽ bị bỏ qua.
     * - Mọi lỗi trong quá trình đọc/ xử lý sẽ được log và ném lại dưới dạng {@link RuntimeException}.
     *
     * @param file          file Excel upload
     * @param campaignId    id chiến dịch (duy trì tham số cho tương thích API)
     * @param headerMetaMap bản đồ meta của header theo chỉ số cột
     * @throws RuntimeException khi có lỗi đọc hoặc xử lý file
     */
    @Override
    @Transactional
    public void importExcel(
            MultipartFile file,
            Long campaignId,
            Map<Integer, IndicatorHeaderMeta> headerMetaMap
    ) {

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            MedicalCampaign campaign = medicalCampaignRepository.findById(campaignId)
                    .orElseThrow(() -> new RuntimeException("Campaign không tồn tại"));

            // Load all students of campaign
            Map<Long, Student> studentMap =
                    studentRepository.findByCampaignId(campaignId)
                            .stream()
                            .collect(Collectors.toMap(Student::getId, Function.identity()));

            //Load all existing result details of campaign
            Map<String, MedicalResultDetail> existingMap =
                    medicalResultDetailRepository.findByCampaignId(campaignId)
                            .stream()
                            .collect(Collectors.toMap(
                                    this::buildKeyForExport,
                                    Function.identity()
                            ));

            List<MedicalResultDetail> toSave = new ArrayList<>();

            // Skip header (3 rows)
            for (int i = 3; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                Long studentId = getLongCellValue(row.getCell(1));
                if (studentId == null) continue;

                Student student = studentMap.get(studentId);
                if (student == null) {
                    throw new RuntimeException("Học sinh không thuộc campaign: " + studentId);
                }

                // Dynamic columns
                for (Map.Entry<Integer, IndicatorHeaderMeta> entry : headerMetaMap.entrySet()) {

                    Cell cell = row.getCell(entry.getKey());
                    if (cell == null) continue;

                    Boolean value = parseBooleanCell(cell);
                    if (value == null) continue;

                    IndicatorHeaderMeta meta = entry.getValue();

                    String key = buildKeyForImport(
                            studentId,
                            campaignId,
                            meta.getGroupId(),
                            meta.getIndicatorId(),
                            meta.getSubIndicatorId()
                    );

                    MedicalResultDetail detail =
                            existingMap.computeIfAbsent(key, k -> {
                                MedicalResultDetail d = new MedicalResultDetail();
                                d.setStudent(student);
                                d.setCampaign(campaign);
                                d.setMedicalGroupId(meta.getGroupId());
                                d.setMedicalIndicatorId(meta.getIndicatorId());
                                d.setMedicalSubIndicatorId(meta.getSubIndicatorId());
                                return d;
                            });

                    detail.setResultValue(value);
                }
            }

            toSave.addAll(existingMap.values());
            medicalResultDetailRepository.saveAll(toSave);

        } catch (Exception e) {
            log.error("Lỗi import Excel", e);
            throw new RuntimeException("Lỗi import Excel: " + e.getMessage());
        }
    }


    /**
     * Lấy giá trị Long từ một ô Excel.
     * <p>
     * Hỗ trợ các trường hợp:
     * - NUMERIC: chuyển giá trị số (double) sang long (cắt phần thập phân).
     * - STRING: trim và parse thành Long; trả về null nếu chuỗi rỗng hoặc không parse được.
     * - FORMULA: lấy kết quả đã tính của formula và xử lý tương tự NUMERIC/STRING.
     * <p>
     * Trả về null khi:
     * - ô null,
     * - loại ô không được hỗ trợ,
     * - hoặc khi có bất kỳ lỗi/parsing exception nào (để tránh crash khi import).
     *
     * @param cell ô Excel cần đọc
     * @return giá trị Long hoặc null nếu không lấy được
     */
    private Long getLongCellValue(Cell cell) {
        if (cell == null) return null;

        try {
            return switch (cell.getCellType()) {

                case NUMERIC -> {
                    // Excel hay lưu số dạng double
                    yield (long) cell.getNumericCellValue();
                }

                case STRING -> {
                    String value = cell.getStringCellValue().trim();
                    if (value.isEmpty()) yield null;
                    yield Long.parseLong(value);
                }

                case FORMULA -> {
                    // lấy kết quả của formula
                    yield switch (cell.getCachedFormulaResultType()) {
                        case NUMERIC -> (long) cell.getNumericCellValue();
                        case STRING -> Long.parseLong(cell.getStringCellValue().trim());
                        default -> null;
                    };
                }

                default -> null;
            };
        } catch (Exception e) {
            return null; // tránh crash khi import
        }
    }

    /**
     * Chuyển giá trị của một ô Excel thành Boolean theo các quy tắc sau:
     * - Nếu ô null trả về null.
     * - Kiểu BOOLEAN: trả trực tiếp giá trị boolean.
     * - Kiểu NUMERIC: chỉ xem là true khi giá trị bằng 1, ngược lại trả false.
     * - Kiểu STRING: trim và chuyển về chữ thường; chuỗi rỗng trả về null; các giá trị
     * hợp lệ để coi là true: "x", "✓", "check", "true", "1", "có".
     * - Kiểu FORMULA: lấy kết quả cached của formula và xử lý giống các kiểu tương ứng
     * (BOOLEAN, NUMERIC, STRING).
     * - Trường hợp không parse được hoặc lỗi sẽ trả về null (để tránh dừng cả quá trình).
     *
     * @param cell ô Excel cần chuyển
     * @return Boolean tương ứng hoặc null nếu không xác định/không parse được
     */
    private Boolean parseBooleanCell(Cell cell) {
        if (cell == null) return null;

        try {
            return switch (cell.getCellType()) {

                case BOOLEAN -> cell.getBooleanCellValue();

                case NUMERIC -> cell.getNumericCellValue() == 1;

                case STRING -> {
                    String value = cell.getStringCellValue().trim().toLowerCase();

                    if (value.isEmpty()) yield null;

                    yield value.equals("x")
                            || value.equals("✓")
                            || value.equals("check")
                            || value.equals("true")
                            || value.equals("1")
                            || value.equals("có");
                }

                case FORMULA -> {
                    yield switch (cell.getCachedFormulaResultType()) {
                        case BOOLEAN -> cell.getBooleanCellValue();
                        case NUMERIC -> cell.getNumericCellValue() == 1;
                        case STRING -> {
                            String v = cell.getStringCellValue().trim().toLowerCase();
                            yield v.equals("x") || v.equals("true") || v.equals("1");
                        }
                        default -> null;
                    };
                }

                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ByteArrayInputStream exportExcel(Long campaignId) {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Kết quả khám");

            // 1. BUILD DYNAMIC COLUMNS (GROUP / INDICATOR / SUB)
            List<ExcelMedicalColumn> dynamicColumns =
                    buildDynamicColumns(campaignId);

            // 2. BUILD HEADER (3 dòng + merge)
            int totalCol = buildHeader(workbook, sheet, dynamicColumns);

            // freeze header
            sheet.createFreezePane(0, 3);

            // 3. STYLE DATA
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            int rowIndex = 3; // sau header

            // 4. LẤY DANH SÁCH HỌC SINH
            List<Student> students =
                    studentRepository.findByCampaignIdOrderByFullNameAsc(campaignId);

            // preload kết quả khám → tránh N+1
            Map<Long, List<MedicalResultDetail>> resultByStudent =
                    medicalResultDetailRepository
                            .findByCampaignId(campaignId)
                            .stream()
                            .collect(Collectors.groupingBy(d -> d.getStudent().getId()));

            int stt = 1;

            for (Student student : students) {

                Row row = sheet.createRow(rowIndex++);
                int col = 0;

                // ===== FIXED COLUMNS =====
                row.createCell(col++).setCellValue(stt++);
                row.createCell(col++).setCellValue(student.getFullName());
                row.createCell(col++).setCellValue(student.getDob().toString());
                row.createCell(col++).setCellValue(student.getGender() == GenderTypeEnum.MALE ? "X" : "");
                row.createCell(col++).setCellValue(student.getGender() == GenderTypeEnum.FEMALE ? "X" : "");
                row.createCell(col++).setCellValue(student.getAddress());
                row.createCell(col++).setCellValue(student.getIdentityNumber());
                row.createCell(col++).setCellValue(
                        student.getWeight() != null ? student.getWeight().doubleValue() : null
                );
                row.createCell(col++).setCellValue(
                        student.getHeight() != null ? student.getHeight().doubleValue() : null
                );
                row.createCell(col++).setCellValue(student.getNotifyFamily());

                // ===== MAP KẾT QUẢ KHÁM =====
                Map<String, MedicalResultDetail> resultMap =
                        resultByStudent
                                .getOrDefault(student.getId(), List.of())
                                .stream()
                                .collect(Collectors.toMap(
                                        this::buildKeyForExport,
                                        Function.identity()
                                ));

                // ===== ĐỔ KẾT QUẢ VÀO CỘT ĐỘNG =====
                for (ExcelMedicalColumn dc : dynamicColumns) {

                    String key = buildKeyForExport(
                            dc.getMedicalGroupId(),
                            dc.getIndicatorId(),
                            dc.getSubIndicatorId()
                    );

                    MedicalResultDetail detail = resultMap.get(key);

                    Cell cell = row.createCell(dc.getColumnIndex());
                    if (detail != null && Boolean.TRUE.equals(detail.getResultValue())) {
                        cell.setCellValue("X");
                    }
                    cell.setCellStyle(dataStyle);
                }
            }

            // set print area
            workbook.setPrintArea(
                    0,
                    0,
                    totalCol - 1,
                    0,
                    sheet.getLastRowNum()
            );

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Lỗi export Excel", e);
        }
    }

    private List<ExcelMedicalColumn> buildDynamicColumns(Long campaignId) {

        List<CampaignMedicalConfigSub> configSubs =
                campaignMedicalConfigSubRepository
                        .findByCampaignIdOrderByDisplayOrderAsc(campaignId);

        List<ExcelMedicalColumn> columns = new ArrayList<>();

        int colIndex = 10; // sau fixed columns

        for (CampaignMedicalConfigSub sub : configSubs) {

            MedicalGroup group = sub.getMedicalGroup();

            List<MedicalIndicator> indicators =
                    medicalIndicatorRepository
                            .findByGroup_IdOrderByDisplayOrderAsc(group.getId());

            for (MedicalIndicator indicator : indicators) {

                if (Boolean.TRUE.equals(indicator.getHasSubIndicator())) {

                    List<MedicalSubIndicator> subs =
                            medicalSubIndicatorRepository
                                    .findByIndicator_IdOrderByDisplayOrderAsc(indicator.getId());

                    for (MedicalSubIndicator si : subs) {
                        columns.add(
                                ExcelMedicalColumn.builder()
                                        .columnIndex(colIndex++)
                                        .medicalGroupId(group.getId())
                                        .medicalGroupName(group.getGroupName())
                                        .indicatorId(indicator.getId())
                                        .indicatorName(indicator.getIndicatorName())
                                        .subIndicatorId(si.getId())
                                        .subIndicatorName(si.getSubName())
                                        .build()
                        );
                    }

                } else {
                    columns.add(
                            ExcelMedicalColumn.builder()
                                    .columnIndex(colIndex++)
                                    .medicalGroupId(group.getId())
                                    .medicalGroupName(group.getGroupName())
                                    .indicatorId(indicator.getId())
                                    .indicatorName(indicator.getIndicatorName())
                                    .build()
                    );
                }
            }
        }

        return columns;
    }

    private String buildKeyForExport(MedicalResultDetail d) {
        return buildKeyForExport(
                d.getMedicalGroupId(),
                d.getMedicalIndicatorId(),
                d.getMedicalSubIndicatorId()
        );
    }

    private String buildKeyForExport(Long g, Long i, Long s) {
        return g + "_" + i + "_" + (s != null ? s : 0);
    }


    private String buildKeyForImport(MedicalResultDetail d) {
        return buildKeyForImport(
                d.getStudent().getId(),
                d.getCampaign().getId(),
                d.getMedicalGroupId(),
                d.getMedicalIndicatorId(),
                d.getMedicalSubIndicatorId()
        );
    }

    private String buildKeyForImport(
            Long studentId,
            Long campaignId,
            Long groupId,
            Long indicatorId,
            Long subIndicatorId
    ) {
        return studentId + "|" + campaignId + "|" +
                groupId + "|" + indicatorId + "|" +
                (subIndicatorId != null ? subIndicatorId : 0);
    }

    public Map<Integer, IndicatorHeaderMeta> parseIndicatorHeader(
            Sheet sheet,
            Long campaignId
    ) {

        // Header:
        // Row 0 → Medical Group
        // Row 1 → Indicator
        // Row 2 → Sub Indicator

        Row groupRow = sheet.getRow(0);
        Row indicatorRow = sheet.getRow(1);
        Row subIndicatorRow = sheet.getRow(2);

        if (groupRow == null || indicatorRow == null) {
            throw new RuntimeException("Header Excel không hợp lệ");
        }

        Map<Integer, IndicatorHeaderMeta> result = new HashMap<>();

        for (int col = 0; col <= groupRow.getLastCellNum(); col++) {

            String groupName = getStringCell(groupRow.getCell(col));
            String indicatorName = getStringCell(indicatorRow.getCell(col));
            String subIndicatorName = getStringCell(
                    subIndicatorRow != null ? subIndicatorRow.getCell(col) : null
            );

            // Bỏ các cột cố định (STT, Họ tên, DOB...)
            if (groupName == null || indicatorName == null) continue;

            // Tìm group / indicator / subIndicator trong DB
            MedicalGroup group =
                    medicalGroupRepository
                            .findByGroupName(groupName)
                            .orElseThrow(() ->
                                    new RuntimeException("Không tìm thấy nhóm khám: " + groupName)
                            );

            MedicalIndicator indicator =
                    medicalIndicatorRepository
                            .findByIndicatorNameAndGroupId(indicatorName, group.getId())
                            .orElseThrow(() ->
                                    new RuntimeException("Không tìm thấy chỉ tiêu: " + indicatorName)
                            );

            MedicalSubIndicator subIndicator = null;

            if (subIndicatorName != null) {
                subIndicator =
                        medicalSubIndicatorRepository
                                .findBySubNameAndIndicatorId(subIndicatorName, indicator.getId())
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Không tìm thấy chỉ số phụ: " + subIndicatorName
                                        )
                                );
            }

            // Build meta
            IndicatorHeaderMeta meta = new IndicatorHeaderMeta();
            meta.setGroupId(group.getId());
            meta.setIndicatorId(indicator.getId());
            meta.setSubIndicatorId(
                    subIndicator != null ? subIndicator.getId() : null
            );

            result.put(col, meta);
        }

        return result;
    }

    private String getStringCell(Cell cell) {
        if (cell == null) return null;

        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
                case FORMULA -> cell.getStringCellValue().trim();
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }
}
