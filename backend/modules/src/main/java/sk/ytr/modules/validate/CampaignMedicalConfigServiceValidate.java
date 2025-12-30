package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.repository.CampaignMedicalConfigRepository;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;

@Component
@RequiredArgsConstructor
public class CampaignMedicalConfigServiceValidate {

    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;
    private final MedicalSubIndicatorRepository subIndicatorRepository;

    public void validateCreateRequest(CampaignMedicalConfigRequestDTO request) {

    }
}

