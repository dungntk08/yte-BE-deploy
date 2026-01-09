package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.MedicalIndicatorService;
import sk.ytr.modules.service.MedicalResultDetailService;
import sk.ytr.modules.service.MedicalSubIndicatorService;
import sk.ytr.modules.service.StudentService;
import sk.ytr.modules.utils.DateUtils;
import sk.ytr.modules.validate.StudentServiceValidate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;
    private final StudentServiceValidate studentServiceValidate;
    private final MedicalGroupRepository medicalGroupRepository;
    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final CampaignMedicalConfigSubRepository campaignMedicalConfigSubRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    private final MedicalResultDetailRepository medicalResultDetailRepository;
    @Lazy
    private final MedicalIndicatorService medicalIndicatorService;
    @Lazy
    private final MedicalSubIndicatorService medicalSubIndicatorService;
    @Lazy
    private final MedicalResultDetailService medicalResultDetailService;
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;


    /**
     * Tạo mới một học sinh.
     *
     * @param request DTO chứa thông tin học sinh cần tạo.
     * @return DTO phản hồi chứa thông tin học sinh vừa được tạo.
     */
    @Override
    @Transactional
    public StudentResponseDTO createStudent(StudentRequestDTO request) {
        try {
            studentServiceValidate.validateCreateRequest(request);
            MedicalCampaign campaign = medicalCampaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));

            Student student = request.toEntity(campaign);
            SchoolClass schoolClass = schoolClassRepository.findById(request.getSchoolClassId()).orElse(null);
            if(schoolClass!=null){
            student.setSchoolClass(schoolClass);
            }
            School school = schoolRepository.findById(request.getSchoolId()).orElse(null);
            if(school!=null) {
                student.setSchool(school);
            }
            student.setCreatedDate(DateUtils.getNow());
            student.setCreatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            student.setModifiedDate(DateUtils.getNow());
            student.setUpdatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            Student dataSaved = studentRepository.save(student);

            // Tạo kết quả khám mặc định cho học sinh mới
            createMedicalResultForStudent(dataSaved);
            return StudentResponseDTO.fromEntity(dataSaved
            );
        } catch (Exception e) {
            log.error("Lỗi tạo học sinh", e);
            throw new RuntimeException("Tạo học sinh thất bại: " + e.getMessage());
        }
    }

    /**
     * Tạo kết quả khám mặc định cho học sinh mới.
     *
     * @param student Học sinh mới được tạo.
     */
    @Override
    public void createMedicalResultForStudent(Student student) {
        try {
            Date createdDate = DateUtils.getNow();
            String createdBy = "SYSTEM";

            CampaignMedicalConfig campaignMedicalConfig = student.getCampaign().getCampaignMedicalConfig();
            List<MedicalIndicator> indicators = medicalIndicatorService.getMedicalIndicators(campaignMedicalConfig);
            List<MedicalSubIndicator> subIndicators = medicalSubIndicatorService.getMedicalSubIndicators(indicators);

            List<MedicalResultDetail> results = createMedicalResults(student, createdDate, createdBy, indicators, subIndicators);

            // Lưu tất cả kết quả khám cùng lúc
            medicalResultDetailRepository.saveAll(results);

        } catch (Exception e) {
            log.error("Lỗi tạo kết quả khám cho học sinh", e);
            throw new RuntimeException("Tạo kết quả khám cho học sinh thất bại: " + e.getMessage());
        }
    }

    private List<MedicalResultDetail> createMedicalResults(Student student, Date createdDate, String createdBy,
                                                           List<MedicalIndicator> indicators, List<MedicalSubIndicator> subIndicators) {
        List<MedicalResultDetail> results = new ArrayList<>();

        for (MedicalIndicator medicalIndicator : indicators) {
            results.add(createMedicalResultDetail(student, createdDate, createdBy, medicalIndicator, null));
        }

        for (MedicalSubIndicator medicalSubIndicator : subIndicators) {
            results.add(createMedicalResultDetail(student, createdDate, createdBy, medicalSubIndicator.getIndicator(), medicalSubIndicator));
        }

        return results;
    }

    private MedicalResultDetail createMedicalResultDetail(Student student, Date createdDate, String createdBy,
                                                          MedicalIndicator medicalIndicator, MedicalSubIndicator medicalSubIndicator) {
        MedicalResultDetail resultDetail = new MedicalResultDetail();
        resultDetail.setCreatedBy(createdBy);
        resultDetail.setCreatedDate(createdDate);
        resultDetail.setStudent(student);
        resultDetail.setCampaign(student.getCampaign());
        resultDetail.setMedicalGroupId(medicalIndicator.getGroup().getId());
        resultDetail.setMedicalIndicatorId(medicalIndicator.getId());
        resultDetail.setMedicalSubIndicatorId(subIndicatorIdOrNull(medicalSubIndicator));
        resultDetail.setResultValue(false); // Giá trị mặc định, có thể thay đổi theo yêu cầu
        return resultDetail;
    }

    private Long subIndicatorIdOrNull(MedicalSubIndicator medicalSubIndicator) {
        return medicalSubIndicator != null ? medicalSubIndicator.getId() : null;
    }

    /**
     * Cập nhật thông tin một học sinh.
     *
     * @param id      ID của học sinh cần cập nhật.
     * @param request DTO chứa thông tin mới của học sinh.
     * @return DTO phản hồi chứa thông tin học sinh đã được cập nhật.
     */
    @Override
    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO request) {
        try {
            studentServiceValidate.validateCreateRequest(request);
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

            student.updateFromRequest(request);
            student.setModifiedDate(DateUtils.getNow());
            student.setUpdatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            return StudentResponseDTO.fromEntity(
                    studentRepository.save(student)
            );
        } catch (Exception e) {
            log.error("Lỗi cập nhật học sinh", e);
            throw new RuntimeException("Cập nhật học sinh thất bại");
        }
    }

    /**
     * Lấy thông tin chi tiết của một học sinh theo ID.
     *
     * @param id ID của học sinh.
     * @return DTO phản hồi chứa thông tin chi tiết của học sinh.
     */
    @Override
    public StudentResponseDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(StudentResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));
    }

    /**
     * Xóa một học sinh theo ID.
     *
     * @param id ID của học sinh cần xóa.
     */
    @Override
    public void deleteStudent(Long id) {
        try {
            studentRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi xóa học sinh", e);
            throw new RuntimeException("Xóa học sinh thất bại");
        }
    }

    /**
     * Lấy danh sách học sinh theo ID đợt khám.
     *
     * @param campaignId ID của đợt khám.
     * @return Danh sách DTO phản hồi chứa thông tin các học sinh trong đợt khám.
     */
    @Override
    public List<StudentResponseDTO> getStudentByCampaignId(Long campaignId, String keyWord) {
        try {
            String safeKeyword =
                    (keyWord == null || keyWord.trim().isEmpty())
                            ? null
                            : keyWord.trim();

            List<Student> students =
                    studentRepository.searchByCampaignAndKeyword(campaignId, safeKeyword);

            List<StudentResponseDTO> result =
                    students.stream()
                            .map(StudentResponseDTO::fromEntity)
                            .toList();

            for (StudentResponseDTO student : result) {
                List<MedicalResultDetailResponseDTO> medicalResults =
                        medicalResultDetailService.getMedicalResultDetailByStudentId(student.getId());
                student.setMedicalResults(medicalResults);
            }

            return result;
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách học sinh theo đợt khám", e);
            throw new RuntimeException("Lấy danh sách học sinh thất bại: " + e.getMessage());
        }
    }

    @Override
    public Page<StudentResponseDTO> getAllStudentByCampaignIdAndFilter(Long campaignId, String keyword, Long schoolId, Long schoolClassId, Pageable pageable) {
        try {
            String safeKeyword = (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim();

            Page<Student> students = studentRepository.searchByCampaignAndFilters(
                    campaignId, safeKeyword, schoolId, schoolClassId, pageable
            );

            return students.map(StudentResponseDTO::fromEntity);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách học sinh theo đợt khám với bộ lọc", e);
            throw new RuntimeException("Lấy danh sách học sinh thất bại: " + e.getMessage());
        }
    }
}

