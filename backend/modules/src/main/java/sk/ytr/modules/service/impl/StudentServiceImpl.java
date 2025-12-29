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

    @Override
    public StudentResponseDTO create(StudentRequestDTO request) {
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

    @Override
    public StudentResponseDTO update(Long id, StudentRequestDTO request) {
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

    @Override
    public StudentResponseDTO getById(Long id) {
        return studentRepository.findById(id)
                .map(StudentResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));
    }

    @Override
    public void delete(Long id) {
        try {
            studentRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi xóa học sinh", e);
            throw new RuntimeException("Xóa học sinh thất bại");
        }
    }

    @Override
    public List<StudentResponseDTO> getByCampaignId(Long campaignId) {
        return studentRepository.findByCampaignId(campaignId)
                .stream()
                .map(StudentResponseDTO::fromEntity)
                .toList();
    }
}

