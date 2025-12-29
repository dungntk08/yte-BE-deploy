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

    @Override
    public MedicalResultDetailResponseDTO create(MedicalResultDetailRequestDTO request) {
        try {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

            CampaignMedicalConfig config = campaignMedicalConfigRepository
                    .findById(request.getCampaignMedicalConfigId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình chỉ tiêu khám"));

            MedicalResultDetail medicalResultDetail = request.toEntity(student, config);
            medicalResultDetail.setCreatedBy("ADMIN"); // tạm thời
            medicalResultDetail.setCreatedDate(DateUtils.getNow());
            medicalResultDetail.setModifiedDate(DateUtils.getNow());
            medicalResultDetail.setUpdatedBy("ADMIN"); // tạm thời
            return MedicalResultDetailResponseDTO.fromEntity(
                    medicalResultDetailRepository.save(medicalResultDetail)
            );
        } catch (Exception e) {
            log.error("Lỗi khi tạo kết quả khám", e);
            throw new RuntimeException("Tạo kết quả khám thất bại");
        }
    }

    @Override
    public MedicalResultDetailResponseDTO update(Long id, MedicalResultDetailRequestDTO request) {
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

    @Override
    public MedicalResultDetailResponseDTO getById(Long id) {
        return medicalResultDetailRepository.findById(id)
                .map(MedicalResultDetailResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám"));
    }

    @Override
    public void delete(Long id) {
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

    @Override
    public List<MedicalResultDetailResponseDTO> getByStudentId(Long studentId) {
        return medicalResultDetailRepository.findByStudentId(studentId)
                .stream()
                .map(MedicalResultDetailResponseDTO::fromEntity)
                .toList();
    }
}
