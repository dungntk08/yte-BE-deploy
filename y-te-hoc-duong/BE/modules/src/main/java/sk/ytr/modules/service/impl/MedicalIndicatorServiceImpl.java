package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalGroup;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.repository.MedicalGroupRepository;
import sk.ytr.modules.repository.MedicalIndicatorRepository;
import sk.ytr.modules.service.MedicalIndicatorService;
import sk.ytr.modules.validate.MedicalIndicatorServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalIndicatorServiceImpl implements MedicalIndicatorService {

    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalGroupRepository groupRepository;
    private final MedicalIndicatorServiceValidate medicalIndicatorServiceValidate;

    /**
     * Tạo mới chỉ tiêu khám.
     *
     * @param request DTO chứa thông tin chỉ tiêu cần tạo.
     * @return DTO phản hồi chứa thông tin chỉ tiêu vừa được tạo.
     */
    @Override
    public MedicalIndicatorResponseDTO createMedicalIndicator(MedicalIndicatorRequestDTO request) {
        try {
            medicalIndicatorServiceValidate.validateCreateRequest(request);
            MedicalGroup group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm chỉ tiêu"));

            MedicalIndicator indicator = MedicalIndicator.builder()
                    .group(group)
                    .indicatorCode(request.getIndicatorCode())
                    .indicatorName(request.getIndicatorName())
                    .displayOrder(request.getDisplayOrder())
                    .isActive(true)
                    .build();

            medicalIndicatorRepository.save(indicator);
            return MedicalIndicatorResponseDTO.fromEntity(indicator);

        } catch (Exception e) {
            throw new RuntimeException("Tạo chỉ tiêu khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Cập nhật chỉ tiêu khám.
     *
     * @param id      ID của chỉ tiêu cần cập nhật.
     * @param request DTO chứa thông tin mới của chỉ tiêu.
     * @return DTO phản hồi chứa thông tin chỉ tiêu đã được cập nhật.
     */
    @Override
    public MedicalIndicatorResponseDTO updateMedicalIndicator(Long id, MedicalIndicatorRequestDTO request) {
        try {

            medicalIndicatorServiceValidate.validateCreateRequest(request);
            MedicalIndicator indicator = medicalIndicatorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ tiêu"));

            indicator.setIndicatorName(request.getIndicatorName());
            indicator.setDisplayOrder(request.getDisplayOrder());
            indicator.setIsActive(request.getIsActive());

            medicalIndicatorRepository.save(indicator);
            return MedicalIndicatorResponseDTO.fromEntity(indicator);

        } catch (Exception e) {
            throw new RuntimeException("Cập nhật chỉ tiêu khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách chỉ tiêu khám theo nhóm.
     *
     * @param groupId ID của nhóm chỉ tiêu.
     * @return danh sách DTO phản hồi chứa thông tin các chỉ tiêu trong nhóm.
     */
    @Override
    public List<MedicalIndicatorResponseDTO> getMedicalIndicatorByGroupId(Long groupId) {
        return medicalIndicatorRepository.findByGroupId(groupId)
                .stream()
                .map(MedicalIndicatorResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Xóa chỉ tiêu khám theo ID.
     *
     * @param id ID của chỉ tiêu cần xóa.
     */
    @Override
    public void deleteMedicalIndicator(Long id) {
        medicalIndicatorRepository.deleteById(id);
    }

    @Override
    public List<MedicalIndicator> getMedicalIndicators(CampaignMedicalConfig campaignMedicalConfig) {
        return medicalIndicatorRepository.findIndicatorsByCampaignMedicalConfigId(campaignMedicalConfig.getId());
    }
}

