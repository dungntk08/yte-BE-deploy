package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.Student;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.StudentRepository;
import sk.ytr.modules.service.StudentService;
import sk.ytr.modules.utils.DateUtils;
import sk.ytr.modules.validate.StudentServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;
    private final StudentServiceValidate studentServiceValidate;

    /**
     * Tạo mới một học sinh.
     *
     * @param request DTO chứa thông tin học sinh cần tạo.
     * @return DTO phản hồi chứa thông tin học sinh vừa được tạo.
     */
    @Override
    public StudentResponseDTO createStudent(StudentRequestDTO request) {
        try {
            studentServiceValidate.validateCreateRequest(request);
            MedicalCampaign campaign = medicalCampaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));

            Student student = request.toEntity(campaign);
            student.setCreatedDate(DateUtils.getNow());
            student.setCreatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            student.setModifiedDate(DateUtils.getNow());
            student.setUpdatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            return StudentResponseDTO.fromEntity(
                    studentRepository.save(student)
            );
        } catch (Exception e) {
            log.error("Lỗi tạo học sinh", e);
            throw new RuntimeException("Tạo học sinh thất bại");
        }
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
    public List<StudentResponseDTO> getStudentByCampaignId(Long campaignId) {
        return studentRepository.findByCampaignId(campaignId)
                .stream()
                .map(StudentResponseDTO::fromEntity)
                .toList();
    }
}

