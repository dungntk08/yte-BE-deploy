package sk.ytr.modules.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.export.SimpleDocxExporterConfiguration;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sk.ytr.modules.constant.GenderTypeEnum;
import sk.ytr.modules.dto.excel.DiseaseReportDTO;
import sk.ytr.modules.dto.excel.ExcelMedicalColumn;
import sk.ytr.modules.dto.excel.IndicatorHeaderMeta;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;
import sk.ytr.modules.dto.response.TotalMedicalIndicatorResultResponseDTO;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.ExcelService;
import sk.ytr.modules.service.MedicalCampaignService;
import sk.ytr.modules.service.MedicalResultDetailService;
import sk.ytr.modules.utils.DateUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;
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
    @Lazy
    private final MedicalIndicatorServiceImpl medicalIndicatorService;
    @Lazy
    private final MedicalSubIndicatorServiceImpl medicalSubIndicatorService;
    @Lazy
    private final MedicalCampaignService medicalCampaignService;
    @Lazy
    private final MedicalResultDetailService medicalResultDetailService;
    private static final DataFormatter DATA_FORMATTER = new DataFormatter();
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final MedicalCampaignSchoolRepository medicalCampaignSchoolRepository;
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
            Map<Integer, IndicatorHeaderMeta> headerMetaMap,
            Long SchoolId,
            Long ClassId
    ) {

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            MedicalCampaign campaign = medicalCampaignRepository.findById(campaignId)
                    .orElseThrow(() -> new RuntimeException("Campaign không tồn tại"));

            // Load all students of campaign
            Map<String, Student> studentMap =
                    studentRepository.findByCampaignId(campaignId)
                            .stream()
                            .collect(Collectors.toMap(Student::getIdentityNumber, Function.identity()));

            //Load all existing result details of campaign
            Map<String, MedicalResultDetail> existingMap =
                    medicalResultDetailRepository.findByCampaignId(campaignId)
                            .stream()
                            .collect(Collectors.toMap(
                                    this::buildKeyForImport,
                                    Function.identity(),
                                    (oldVal, newVal) -> oldVal   // <<< QUAN TRỌNG
                            ));


            School school = schoolRepository.findById(SchoolId).orElse(null);
            SchoolClass  schoolClass = schoolClassRepository.findById(ClassId).orElse(null);
            List<MedicalResultDetail> toSave = new ArrayList<>();

            saveMedicalCampaignSchool(school, campaign);
            // Skip header (3 rows)
            for (int i = 5; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null && row.getCell(1) == null && row.getCell(2) == null ) continue;

                String studentIdentityNumber = String.valueOf(row.getCell(6));
                if (studentIdentityNumber == null && !studentIdentityNumber.isEmpty()) continue;

                Student student = studentMap.get(studentIdentityNumber);
                if (student == null && !studentIdentityNumber.isEmpty()) {
                    Student newStudent = new Student();
                    newStudent.setUpdatedBy("SYSTEM");
                    newStudent.setCreatedBy("SYSTEM");
                    newStudent.setCreatedDate(DateUtils.getNow());
                    newStudent.setModifiedDate(DateUtils.getNow());
                    student = updateStudentWhenImport(newStudent, campaign, studentIdentityNumber, row, school, schoolClass);
                    studentMap.put(studentIdentityNumber, newStudent);
                }
                else if(student != null) {
                        student.setUpdatedBy("SYSTEM");
                        student.setModifiedDate(DateUtils.getNow());
                        student = updateStudentWhenImport(student, campaign, studentIdentityNumber, row, school, schoolClass);
                }
                if(student == null ) {
                    continue;
                }
                // Dynamic columns
                for (Map.Entry<Integer, IndicatorHeaderMeta> entry : headerMetaMap.entrySet()) {

                    Cell cell = row.getCell(entry.getKey());
                    if (cell == null) continue;
                    if(student.getFullName().equalsIgnoreCase("Nguyễn Anh Nhi")){
                        int a = 3;
                    }
                    Boolean value = parseBooleanCell(cell);
                    if (value == null) value = false;

                    IndicatorHeaderMeta meta = entry.getValue();

                    String key = buildKeyForImport(
                            studentIdentityNumber,
                            campaignId,
                            meta.getGroupId(),
                            meta.getIndicatorId(),
                            meta.getSubIndicatorId()
                    );

                    Student finalStudent = student;
                    MedicalResultDetail detail =
                            existingMap.computeIfAbsent(key, k -> {
                                MedicalResultDetail d = new MedicalResultDetail();
                                d.setUpdatedBy("SYSTEM");
                                d.setCreatedBy("SYSTEM");
                                d.setCreatedDate(DateUtils.getNow());
                                d.setModifiedDate(DateUtils.getNow());
                                d.setStudent(finalStudent);
                                d.setCampaign(campaign);
                                d.setMedicalGroupId(meta.getGroupId());
                                d.setMedicalIndicatorId(meta.getIndicatorId());
                                d.setMedicalSubIndicatorId(meta.getSubIndicatorId());
                                return d;
                            });

                    detail.setResultValue(value);
                    detail.setUpdatedBy("SYSTEM");
                    detail.setModifiedDate(DateUtils.getNow());
                }
            }

            toSave.addAll(existingMap.values());
            medicalResultDetailRepository.saveAll(toSave);

        } catch (Exception e) {
            log.error("Lỗi import Excel", e);
            throw new RuntimeException("Lỗi import Excel: " + e.getMessage());
        }
    }

    private void saveMedicalCampaignSchool(School school, MedicalCampaign campaign) {
        Boolean exists = medicalCampaignSchoolRepository.existsByMedicalCampaignAndMedicalGroup(
                school.getId(), campaign.getId()
        );

        if (!exists) {
            MedicalCampaignSchool campaignSchool = new MedicalCampaignSchool();
            campaignSchool.setSchool(school);
            campaignSchool.setMedicalCampaign(campaign);
            medicalCampaignSchoolRepository.save(campaignSchool);
        }
    }

    /* Cập nhật thông tin học sinh khi import */
    private Student updateStudentWhenImport(Student newStudent,
                                            MedicalCampaign campaign,
                                            String studentIdentityNumber,
                                            Row row,
                                            School school,
                                            SchoolClass SchoolClass) {
        Student student;
        newStudent.setSchool(school);
        newStudent.setSchoolClass(SchoolClass);
        newStudent.setCampaign(campaign);
        newStudent.setIdentityNumber(studentIdentityNumber);
        newStudent.setFullName(getStringCell(row.getCell(1)));
        newStudent.setDob(parseDateCell(row.getCell(2)));
        if(getStringCell(row.getCell(3)) == null || getStringCell(row.getCell(3)).isEmpty()){
            newStudent.setGender(GenderTypeEnum.FEMALE);
        }
        else{
            newStudent.setGender(GenderTypeEnum.MALE);
        }
        newStudent.setAddress(getStringCell(row.getCell(5)));
        newStudent.setHeight( getNumericCellValueAsBigDecimal(row.getCell(7)) );
        newStudent.setWeight( getNumericCellValueAsBigDecimal(row.getCell(8)) );
        student = studentRepository.save(newStudent);
        return student;
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
                row.createCell(col++).setCellValue(
                        student.getClassName() != null ? student.getClassName() : ""
                );
                row.createCell(col++).setCellValue(student.getAddress());
                row.createCell(col++).setCellValue(student.getIdentityNumber());
                row.createCell(col++).setCellValue(
                        student.getWeight() != null ? student.getWeight().doubleValue() : 0.0
                );
                row.createCell(col++).setCellValue(
                        student.getHeight() != null ? student.getHeight().doubleValue() : 0.0
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
                        .findByCampaignMedicalConfigIdOrderByDisplayOrderAsc(campaignId);

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
                d.getStudent().getIdentityNumber(),
                d.getCampaign().getId(),
                d.getMedicalGroupId(),
                d.getMedicalIndicatorId(),
                d.getMedicalSubIndicatorId()
        );
    }

    private String buildKeyForImport(
            String studentIdentityNumber,
            Long campaignId,
            Long groupId,
            Long indicatorId,
            Long subIndicatorId
    ) {
        return studentIdentityNumber + "|" + campaignId + "|" +
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

        Row groupRow = sheet.getRow(2);
        Row indicatorRow = sheet.getRow(3);
        Row subIndicatorRow = sheet.getRow(4);

        if (groupRow == null || indicatorRow == null) {
            throw new RuntimeException("Header Excel không hợp lệ");
        }

        Map<Integer, IndicatorHeaderMeta> result = new HashMap<>();

        for (int col = 10; col <= groupRow.getLastCellNum(); col++) {

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

            if (subIndicatorName != null && !subIndicatorName.isEmpty()) {
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

    /**
     * Export file Excel mẫu kết quả khám
     *
     * @param campaignId id chiến dịch
     * @return ByteArrayInputStream của file Excel
     */
    @Override
    public ByteArrayInputStream exportTemplateExcel(Long campaignId) {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Mẫu kết quả khám");

            CellStyle titleStyle = createBorderStyle(workbook, true);
            CellStyle headerStyle = createBorderStyle(workbook, true);

            // ========= 1. LẤY STUDENT MẪU =========
            MedicalCampaign campaign =
                    medicalCampaignRepository.findById(campaignId)
                            .orElseThrow(() -> new RuntimeException("Campaign không tồn tại"));

//            SchoolClass schoolClass =  schoolClassRepository.findById(ClassId).orElse(null);
//            School school = schoolRepository.findById(schoolId).orElse(null);
//            String className = schoolClass.getClassName() != null ? schoolClass.getClassName(): "……";
//            String schoolName = school.getSchoolName() != null ? school.getSchoolName() : "……………………";

            // ========= 2. DÒNG TIÊU ĐỀ =========
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(
                    "DANH SÁCH HỌC SINH KHÁM, KIỂM TRA SỨC KHỎE ĐỊNH KỲ NĂM HỌC 2025 - 2026"
            );
            titleCell.setCellStyle(titleStyle);

            // ========= 3. DÒNG LỚP / TRƯỜNG =========
//            Row infoRow = sheet.createRow(1);
//            Cell infoCell = infoRow.createCell(0);
//            infoCell.setCellValue(
//                    "Lớp: " + className + " ; Trường: " + schoolName
//            );
//            infoCell.setCellStyle(titleStyle);

            // ========= 4. BUILD CỘT ĐỘNG =========
            List<ExcelMedicalColumn> dynamicColumns =
                    buildDynamicColumnsTemplate(campaignId);

            // Tổng số cột
            int totalCol = 10 + dynamicColumns.size() - 1;

            // Merge 2 dòng đầu
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalCol));
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, totalCol));

            // ========= 5. BUILD HEADER (3 dòng) =========
            buildHeaderAtRow(
                    workbook,
                    sheet,
                    dynamicColumns,
                    2 // bắt đầu header từ row 2
            );

            // ========= 6. FREEZE =========
            sheet.createFreezePane(0, 5);

            // ========= 7. AUTO SIZE =========
            for (int i = 0; i <= totalCol; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Lỗi export Excel mẫu", e);
        }
    }

    /**
     * Xây dựng danh sách các cột động (dynamic columns) cho mẫu Excel dựa trên cấu hình của chiến dịch y tế.
     *
     * <p>Quy trình:
     * - Lấy cấu hình chiến dịch y tế từ `CampaignMedicalConfig`.
     * - Duyệt qua các nhóm chỉ tiêu (MedicalGroup) và chỉ tiêu (MedicalIndicator) để tạo các cột tương ứng.
     * - Nếu chỉ tiêu có chỉ số phụ (sub-indicator), tạo thêm các cột cho từng chỉ số phụ.
     *
     * <p>Đầu ra:
     * - Trả về danh sách các cột động, mỗi cột chứa thông tin về nhóm, chỉ tiêu, và chỉ số phụ (nếu có).
     *
     * @param campaignId ID của chiến dịch y tế
     * @return Danh sách các cột động (ExcelMedicalColumn)
     * @throws RuntimeException nếu không tìm thấy chiến dịch y tế
     */
    private List<ExcelMedicalColumn> buildDynamicColumnsTemplate(Long campaignId) {

        List<ExcelMedicalColumn> columns = new ArrayList<>();
        CampaignMedicalConfig campaignMedicalConfig =
                medicalCampaignRepository.findById(campaignId)
                        .orElseThrow(() -> new RuntimeException("Campaign không tồn tại"))
                        .getCampaignMedicalConfig();

        // Ví dụ: lấy từ cấu hình campaign_medical_config
        List<CampaignMedicalConfigSub> configs =
                campaignMedicalConfigSubRepository
                        .findByCampaignMedicalConfig_IdOrderByDisplayOrderAsc(campaignMedicalConfig.getId());
        List<MedicalIndicator> indicators = medicalIndicatorService.getMedicalIndicators(campaignMedicalConfig);
        List<MedicalSubIndicator> subIndicators = medicalSubIndicatorService.getMedicalSubIndicators(indicators);
        int colIndex = 10; // sau 10 cột cố định

        for (CampaignMedicalConfigSub cfg : configs) {

            for(MedicalIndicator indicator : indicators) {
                if(!indicator.getGroup().getId().equals(cfg.getMedicalGroup().getId())) {
                    continue;
                }
                if (Boolean.TRUE.equals(indicator.getHasSubIndicator())) {
                    List<MedicalSubIndicator> subs = subIndicators.stream()
                            .filter(sub -> sub.getIndicator().getId().equals(indicator.getId()))
                            .collect(Collectors.toList());
                    for (MedicalSubIndicator sub : subs) {
                        ExcelMedicalColumn col = new ExcelMedicalColumn();
                        col.setColumnIndex(colIndex++);
                        col.setMedicalGroupId(cfg.getMedicalGroup().getId());
                        col.setMedicalGroupName(cfg.getMedicalGroup().getGroupName());
                        col.setIndicatorId(indicator.getId());
                        col.setIndicatorName(indicator.getIndicatorName());
                        col.setSubIndicatorId(sub.getId());
                        col.setSubIndicatorName(sub.getSubName());
                        columns.add(col);
                    }
                } else {
                    ExcelMedicalColumn col = new ExcelMedicalColumn();
                    col.setColumnIndex(colIndex++);
                    col.setMedicalGroupId(cfg.getMedicalGroup().getId());
                    col.setMedicalGroupName(cfg.getMedicalGroup().getGroupName());
                    col.setIndicatorId(indicator.getId());
                    col.setIndicatorName(indicator.getIndicatorName());
                    columns.add(col);
                }
            }
        }

        return columns;
    }


    private CellStyle createBorderStyle(Workbook workbook, boolean bold) {

        CellStyle style = workbook.createCellStyle();

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        Font font = workbook.createFont();
        font.setBold(bold);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);

        return style;
    }

    public int buildHeaderAtRow(
            Workbook workbook,
            Sheet sheet,
            List<ExcelMedicalColumn> dynamicColumns,
            int startRow
    ) {

        CellStyle headerStyle = createBorderStyle(workbook, true);

        Row groupRow = sheet.createRow(startRow);
        Row indicatorRow = sheet.createRow(startRow + 1);
        Row subRow = sheet.createRow(startRow + 2);

        // ================= FIXED COLUMNS =================
        String[] fixedHeaders = {
                "STT",
                "Họ và tên học sinh",
                "Ngày sinh",
                "Nam",
                "Nữ",
                "Địa chỉ",
                "CCCD",
                "Cân nặng",
                "Chiều cao",
                "TB GĐ"
        };

        int colIndex = 0;

        for (String header : fixedHeaders) {

            // tạo cell đủ 3 row
            createCell(groupRow, colIndex, header, headerStyle);
            createCell(indicatorRow, colIndex, "", headerStyle);
            createCell(subRow, colIndex, "", headerStyle);

            CellRangeAddress region =
                    new CellRangeAddress(startRow, startRow + 2, colIndex, colIndex);
            sheet.addMergedRegion(region);
            setBorderForMergedRegion(sheet, region);

            colIndex++;
        }

        int dynamicStartCol = colIndex;

        // ================= DYNAMIC COLUMNS =================
        for (ExcelMedicalColumn col : dynamicColumns) {

            int c = col.getColumnIndex();

            createCell(groupRow, c, col.getMedicalGroupName(), headerStyle);
            createCell(indicatorRow, c, col.getIndicatorName(), headerStyle);
            createCell(
                    subRow,
                    c,
                    col.getSubIndicatorName() != null ? col.getSubIndicatorName() : "",
                    headerStyle
            );
        }

        int dynamicEndCol = dynamicColumns.stream()
                .mapToInt(ExcelMedicalColumn::getColumnIndex)
                .max()
                .orElse(dynamicStartCol);

        // ================= MERGE GROUP =================
        mergeAndBorderSameCell(sheet, groupRow, startRow, dynamicStartCol, dynamicEndCol);

        // ================= MERGE INDICATOR =================
        mergeAndBorderSameCell(sheet, indicatorRow, startRow + 1, dynamicStartCol, dynamicEndCol);

        // ================= MERGE INDICATOR WITHOUT SUB =================
        for (ExcelMedicalColumn col : dynamicColumns) {
            if (col.getSubIndicatorName() == null) {
                CellRangeAddress region =
                        new CellRangeAddress(
                                startRow + 1,
                                startRow + 2,
                                col.getColumnIndex(),
                                col.getColumnIndex()
                        );
                sheet.addMergedRegion(region);
                setBorderForMergedRegion(sheet, region);
            }
        }

        // ================= FULL COLUMN BORDER (QUAN TRỌNG NHẤT) =================
        applyBorderForColumns(
                sheet,
                workbook,
                0,
                dynamicEndCol,
                startRow,
                startRow + 2 + 200 // kéo xuống 200 dòng cho nhập liệu
        );

        return dynamicEndCol;
    }

    private void mergeAndBorderSameCell(
            Sheet sheet,
            Row row,
            int rowIndex,
            int startCol,
            int endCol
    ) {
        int col = startCol;

        while (col <= endCol) {

            String val = getCellValue(row.getCell(col));
            int from = col;

            while (col + 1 <= endCol &&
                    Objects.equals(val, getCellValue(row.getCell(col + 1)))) {
                col++;
            }

            if (from < col) {
                CellRangeAddress region =
                        new CellRangeAddress(rowIndex, rowIndex, from, col);
                sheet.addMergedRegion(region);
                setBorderForMergedRegion(sheet, region);
            }

            col++;
        }
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void setBorderForMergedRegion(
            Sheet sheet,
            CellRangeAddress region
    ) {
        RegionUtil.setBorderTop(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderBottom(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderLeft(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderRight(BorderStyle.THIN, region, sheet);
    }

    private void applyBorderForColumns(
            Sheet sheet,
            Workbook workbook,
            int fromCol,
            int toCol,
            int fromRow,
            int toRow
    ) {
        CellStyle borderStyle = createBorderStyle(workbook, false);

        for (int c = fromCol; c <= toCol; c++) {
            for (int r = fromRow; r <= toRow; r++) {

                Row row = sheet.getRow(r);
                if (row == null) row = sheet.createRow(r);

                Cell cell = row.getCell(c);
                if (cell == null) cell = row.createCell(c);

                cell.setCellStyle(borderStyle);
            }
        }
    }

    private String getCellValue(Cell cell) {

        if (cell == null) {
            return "";
        }

        try {
            return switch (cell.getCellType()) {

                case STRING -> cell.getStringCellValue().trim();

                case NUMERIC -> {
                    if (DateUtil.isCellDateFormatted(cell)) {
                        yield cell.getDateCellValue().toString();
                    }
                    yield String.valueOf(cell.getNumericCellValue());
                }

                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());

                case FORMULA -> {
                    yield switch (cell.getCachedFormulaResultType()) {
                        case STRING -> cell.getStringCellValue().trim();
                        case NUMERIC -> String.valueOf(cell.getNumericCellValue());
                        case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                        default -> "";
                    };
                }

                case BLANK, _NONE, ERROR -> "";

                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
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

    private BigDecimal getNumericCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;

        try {
            String value = DATA_FORMATTER.formatCellValue(cell).trim();
            if (value.isEmpty()) return null;

            value = value.replace(",", ".");
            return new BigDecimal(value);
        } catch (Exception e) {
            return null;
        }
    }


    private Date parseDateCell(Cell cell) {
        if (cell == null) {
            return null;
        }

        try {
            // Excel lưu date dạng numeric
            if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                // fallback numeric date
                return DateUtil.getJavaDate(cell.getNumericCellValue());
            }

            // Excel lưu dạng text
            if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue();
                if (value == null || value.trim().isEmpty()) {
                    return null;
                }
                return DateUtils.convertStringToDate(value.trim());
            }

        } catch (Exception e) {
            throw new RuntimeException("Không thể parse ngày sinh từ cell: " + cell, e);
        }

        return null;
    }
//
//    public byte[] exportCampaignSummaryReportForPDF(Long campaignId) {
//        try {
//            // Lấy dữ liệu đợt khám
//            MedicalCampaignResponseDTO campaign =
//                    medicalCampaignService.getMedicalCampaignById(campaignId);
//
//            // Lấy tổng kết bệnh
//            List<TotalMedicalIndicatorResultResponseDTO> indicatorResults =
//                    medicalResultDetailService.getTotalMedicalIndicatorResultsByCampaignId(campaignId);
//
//            // Map sang dataset cho Jasper
//            List<DiseaseReportDTO> diseaseDataset =
//                    DiseaseReportMapper.mapToDiseaseDataset(indicatorResults);
//
//            JRBeanCollectionDataSource diseaseDataSource =
//                    new JRBeanCollectionDataSource(diseaseDataset);
//
//            // Params Jasper
//            Map<String, Object> params = new HashMap<>();
//            params.put("P_SCHOOL_NAME", campaign.getSchool().getSchoolName());
//            params.put("P_TOTAL_CLASS", 0);
//            params.put("P_TOTAL_STUDENT", campaign.getTotalStudents());
//            params.put("P_TOTAL_STUDENT_EXAM", campaign.getTotalStudentsExamined());
//
//            String examRate = campaign.getTotalStudents() == 0
//                    ? "0%"
//                    : Math.round(
//                    campaign.getTotalStudentsExamined() * 100.0
//                            / campaign.getTotalStudents()
//            ) + "%";
//
//            params.put("P_EXAM_RATE", examRate);
//            params.put("P_SCHOOL_YEAR", campaign.getSchoolYear());
//
//            // TODO: nếu có thống kê dinh dưỡng riêng thì thay vào
//            params.put("P_NUTRITION_UNDERWEIGHT", 0);
//            params.put("P_NUTRITION_OVERWEIGHT", 0);
//            params.put("P_NUTRITION_OBESE", 0);
//
//            params.put("P_DISEASE_DATA", diseaseDataSource);
//
//            // Load Jasper
//            InputStream jrxmlStream =
//                    getClass().getResourceAsStream(
//                            "/reports/Bien_ban_thong_nhat_kham_hs.jrxml"
//                    );
//
//            if (jrxmlStream == null) {
//                throw new RuntimeException("Không tìm thấy file JRXML");
//            }
//
//            JasperReport jasperReport =
//                    JasperCompileManager.compileReport(jrxmlStream);
//
//            JasperPrint jasperPrint =
//                    JasperFillManager.fillReport(
//                            jasperReport,
//                            params,
//                            new JREmptyDataSource()
//                    );
//
//            return JasperExportManager.exportReportToPdf(jasperPrint);
//
//        } catch (Exception e) {
//            throw new RuntimeException("Xuất biên bản khám thất bại", e);
//        }
//    }

//    public byte[] exportCampaignSummaryReportToWord(Long campaignId) {
//
//        try {
//            // ===== 1. LẤY DỮ LIỆU =====
//            MedicalCampaignResponseDTO campaign =
//                    medicalCampaignService.getMedicalCampaignById(campaignId);
//
//            List<TotalMedicalIndicatorResultResponseDTO> indicatorResults =
//                    medicalResultDetailService.getTotalMedicalIndicatorResultsByCampaignId(campaignId);
//
//            List<DiseaseReportDTO> diseaseDataset =
//                    DiseaseReportMapper.mapToDiseaseDataset(indicatorResults);
//
//            JRBeanCollectionDataSource diseaseDataSource =
//                    new JRBeanCollectionDataSource(diseaseDataset);
//
//            // ===== 2. PARAMS =====
//            Map<String, Object> params = new HashMap<>();
//            params.put("P_SCHOOL_NAME", campaign.getSchool().getSchoolName());
//            params.put("P_TOTAL_CLASS", 0);
//            params.put("P_TOTAL_STUDENT", campaign.getTotalStudents());
//            params.put("P_TOTAL_STUDENT_EXAM", campaign.getTotalStudentsExamined());
//
//            String examRate = campaign.getTotalStudents() == 0
//                    ? "0%"
//                    : Math.round(
//                    campaign.getTotalStudentsExamined() * 100.0
//                            / campaign.getTotalStudents()
//            ) + "%";
//
//            params.put("P_EXAM_RATE", examRate);
//            params.put("P_SCHOOL_YEAR", campaign.getSchoolYear());
//
//            params.put("P_NUTRITION_UNDERWEIGHT", 0);
//            params.put("P_NUTRITION_OVERWEIGHT", 0);
//            params.put("P_NUTRITION_OBESE", 0);
//
//            params.put("P_DISEASE_DATA", diseaseDataSource);
//
//            // ===== 3. LOAD JRXML =====
//            InputStream jrxmlStream =
//                    getClass().getResourceAsStream(
//                            "/reports/Bien_ban_thong_nhat_kham_hs.jrxml"
//                    );
//
//            if (jrxmlStream == null) {
//                throw new RuntimeException("Không tìm thấy file JRXML");
//            }
//
//            JasperReport jasperReport =
//                    JasperCompileManager.compileReport(jrxmlStream);
//
//            JasperPrint jasperPrint =
//                    JasperFillManager.fillReport(
//                            jasperReport,
//                            params,
//                            new JREmptyDataSource()
//                    );
//
//            // ===== 4. EXPORT WORD =====
//            ByteArrayOutputStream out = new ByteArrayOutputStream();
//
//            JRDocxExporter exporter = new JRDocxExporter();
//            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
//            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(out));
//
//            SimpleDocxExporterConfiguration config =
//                    new SimpleDocxExporterConfiguration();
//
//            exporter.setConfiguration(config);
//            exporter.exportReport();
//
//            return out.toByteArray();
//
//        } catch (Exception e) {
//            throw new RuntimeException("Xuất biên bản khám WORD thất bại", e);
//        }
//    }

}
