package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.repository.CampaignMedicalConfigRepository;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;

@RequiredArgsConstructor
public class CampaignMedicalConfigServiceValidate {

    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;
    private final MedicalSubIndicatorRepository subIndicatorRepository;

    public void validateCreateRequest(CampaignMedicalConfigRequestDTO request) {

        if (request.getCampaignId() == null) {
            throw new IllegalArgumentException("đợt khám không được để trống");
        }

        if (request.getSubIndicatorId() == null) {
            throw new IllegalArgumentException("chỉ tiêu con không được để trống");
        }

        if (request.getIsRequired() == null) {
            throw new IllegalArgumentException("isRequired không được để trống");
        }

        // ===== CHECK TỒN TẠI =====
        if (!medicalCampaignRepository.existsById(request.getCampaignId())) {
            throw new IllegalArgumentException("đợt khám không tồn tại");
        }

        if (!subIndicatorRepository.existsById(request.getSubIndicatorId())) {
            throw new IllegalArgumentException("chỉ tiêu con không tồn tại");
        }

        // ===== CHECK TRÙNG CẤU HÌNH =====
        boolean exists = campaignMedicalConfigRepository
                .existsByCampaign_IdAndSubIndicator_Id(
                        request.getCampaignId(),
                        request.getSubIndicatorId()
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "Chỉ tiêu này đã được cấu hình trong đợt khám"
            );
        }
    }
}

