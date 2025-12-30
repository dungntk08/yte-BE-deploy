package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalResultDetail;
import sk.ytr.modules.entity.Student;
import sk.ytr.modules.repository.CampaignMedicalConfigRepository;
import sk.ytr.modules.repository.MedicalResultDetailRepository;
import sk.ytr.modules.repository.StudentRepository;
import sk.ytr.modules.service.MedicalResultDetailService;
import sk.ytr.modules.utils.DateUtils;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalResultDetailServiceImpl implements MedicalResultDetailService {

    private final MedicalResultDetailRepository medicalResultDetailRepository;
    private final StudentRepository studentRepository;
    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;

    /**
     * Tạo mới kết quả khám bệnh.
     *
     * @param request DTO chứa thông tin yêu cầu tạo kết quả khám.
     * @return DTO chứa thông tin kết quả khám vừa được tạo.
     */
    @Override
    public MedicalResultDetailResponseDTO createMedicalResultDetail(MedicalResultDetailRequestDTO request) {
        try {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

            MedicalResultDetail medicalResultDetail = request.toEntity(student, request);
            medicalResultDetail.setCreatedBy("ADMIN"); // tạm thời
            medicalResultDetail.setCreatedDate(DateUtils.getNow());
            medicalResultDetail.setModifiedDate(DateUtils.getNow());
            medicalResultDetail.setUpdatedBy("ADMIN"); // tạm thời
            return MedicalResultDetailResponseDTO.fromEntity(
                    medicalResultDetailRepository.save(medicalResultDetail)
            );
        } catch (RuntimeException e) {
            log.error("Lỗi khi tạo kết quả khám: {}", e.getMessage(), e);
            throw new RuntimeException("Tạo kết quả khám thất bại: " + e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo kết quả khám", e);
            throw new RuntimeException("Tạo kết quả khám thất bại");
        }
    }

    /**
     * Cập nhật kết quả khám bệnh.
     *
     * @param id      ID của kết quả khám cần cập nhật.
     * @param request DTO chứa thông tin mới của kết quả khám.
     * @return DTO chứa thông tin kết quả khám đã được cập nhật.
     */
    @Override
    public MedicalResultDetailResponseDTO updateMedicalResultDetail(Long id, MedicalResultDetailRequestDTO request) {
        try {
            MedicalResultDetail medicalResultDetail = medicalResultDetailRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám"));

            medicalResultDetail.updateFromRequest(request);
            medicalResultDetail.setModifiedDate(DateUtils.getNow());
            medicalResultDetail.setUpdatedBy("ADMIN"); // tạm thời

            return MedicalResultDetailResponseDTO.fromEntity(
                    medicalResultDetailRepository.save(medicalResultDetail)
            );
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật kết quả khám", e);
            throw new RuntimeException("Cập nhật kết quả khám thất bại");
        }
    }

    /**
     * Lấy thông tin chi tiết của một kết quả khám bệnh theo ID.
     *
     * @param id ID của kết quả khám.
     * @return DTO chứa thông tin chi tiết của kết quả khám.
     */
    @Override
    public MedicalResultDetailResponseDTO getMedicalResultDetailById(Long id) {
        return medicalResultDetailRepository.findById(id)
                .map(MedicalResultDetailResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám"));
    }

    /**
     * Xóa kết quả khám bệnh theo ID.
     *
     * @param id ID của kết quả khám cần xóa.
     */
    @Override
    public void deleteMedicalResultDetail(Long id) {
        try {
            if (!medicalResultDetailRepository.existsById(id)) {
                throw new RuntimeException("Kết quả khám không tồn tại");
            }
            medicalResultDetailRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi khi xóa kết quả khám", e);
            throw new RuntimeException("Xóa kết quả khám thất bại");
        }
    }

    /**
     * Lấy danh sách kết quả khám bệnh theo ID học sinh.
     *
     * @param studentId ID của học sinh.
     * @return danh sách DTO chứa thông tin các kết quả khám của học sinh.
     */
    @Override
    public List<MedicalResultDetailResponseDTO> getMedicalResultDetailByStudentId(Long studentId) {
        return medicalResultDetailRepository.findByStudentId(studentId)
                .stream()
                .map(MedicalResultDetailResponseDTO::fromEntity)
                .toList();
    }
}
