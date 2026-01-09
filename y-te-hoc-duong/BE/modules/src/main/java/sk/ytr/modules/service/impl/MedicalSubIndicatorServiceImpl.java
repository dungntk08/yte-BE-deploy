package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.entity.MedicalSubIndicator;
import sk.ytr.modules.repository.MedicalIndicatorRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;
import sk.ytr.modules.service.MedicalSubIndicatorService;
import sk.ytr.modules.validate.MedicalSubIndicatorServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalSubIndicatorServiceImpl implements MedicalSubIndicatorService {

    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorServiceValidate medicalSubIndicatorServiceValidate;

    /**
     * Tạo mới chỉ số con cho chỉ tiêu khám.
     *
     * @param request DTO chứa thông tin chỉ số con cần tạo.
     * @return DTO phản hồi chứa thông tin chỉ số con vừa được tạo.
     */
    @Override
    public MedicalSubIndicatorResponseDTO createMedicalSubIndicator(MedicalSubIndicatorRequestDTO request) {
        try {
            medicalSubIndicatorServiceValidate.validateCreateRequest(request);
            MedicalIndicator indicator = medicalIndicatorRepository.findById(request.getIndicatorId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ tiêu khám"));

            MedicalSubIndicator entity = request.toEntity(indicator);
            return MedicalSubIndicatorResponseDTO.fromEntity(
                    medicalSubIndicatorRepository.save(entity)
            );
        } catch (Exception e) {
            log.error("Lỗi tạo chỉ số con", e);
            throw new RuntimeException("Tạo chỉ số con thất bại: " + e.getMessage());
        }
    }

    /**
     * Cập nhật chỉ số con cho chỉ tiêu khám.
     *
     * @param id      ID của chỉ số con cần cập nhật.
     * @param request DTO chứa thông tin mới của chỉ số con.
     * @return DTO phản hồi chứa thông tin chỉ số con đã được cập nhật.
     */
    @Override
    public MedicalSubIndicatorResponseDTO updateMedicalSubIndicator(Long id, MedicalSubIndicatorRequestDTO request) {
        try {
            medicalSubIndicatorServiceValidate.validateCreateRequest(request);
            MedicalSubIndicator entity = medicalSubIndicatorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ số con"));

            entity.setSubCode(request.getSubCode());
            entity.setSubName(request.getSubName());
            entity.setDisplayOrder(request.getDisplayOrder());
            entity.setIsActive(request.getIsActive());

            return MedicalSubIndicatorResponseDTO.fromEntity(
                    medicalSubIndicatorRepository.save(entity)
            );
        } catch (Exception e) {
            log.error("Lỗi cập nhật chỉ số con", e);
            throw new RuntimeException("Cập nhật chỉ số con thất bại: " + e.getMessage());
        }
    }

    /**
     * Lấy thông tin chi tiết của một chỉ số con theo ID.
     *
     * @param id ID của chỉ số con.
     * @return DTO phản hồi chứa thông tin chi tiết của chỉ số con.
     */
    @Override
    public MedicalSubIndicatorResponseDTO getMedicalSubIndicatorById(Long id) {
        return medicalSubIndicatorRepository.findById(id)
                .map(MedicalSubIndicatorResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ số con"));
    }

    /**
     * Xóa một chỉ số con theo ID.
     *
     * @param id ID của chỉ số con cần xóa.
     */
    @Override
    public void deleteMedicalSubIndicator(Long id) {
        try {
            medicalSubIndicatorRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi xóa chỉ số con", e);
            throw new RuntimeException("Xóa chỉ số con thất bại: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách chỉ số con theo ID chỉ tiêu.
     *
     * @param indicatorId ID của chỉ tiêu.
     * @return Danh sách DTO phản hồi chứa thông tin các chỉ số con thuộc chỉ tiêu.
     */
    @Override
    public List<MedicalSubIndicatorResponseDTO> getMedicalSubIndicatorByIndicatorId(Long indicatorId) {
        return medicalSubIndicatorRepository.findByIndicatorId(indicatorId)
                .stream()
                .map(MedicalSubIndicatorResponseDTO::fromEntity)
                .toList();
    }

    public List<MedicalSubIndicator> getMedicalSubIndicators(List<MedicalIndicator> indicators) {
        List<Long> indicatorIds = indicators.stream()
                .map(MedicalIndicator::getId)
                .toList();
        return medicalSubIndicatorRepository.findByIndicatorIdIn(indicatorIds);
    }
}
