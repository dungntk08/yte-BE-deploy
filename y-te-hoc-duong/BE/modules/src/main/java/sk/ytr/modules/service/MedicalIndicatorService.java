package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalIndicator;

import java.util.List;

public interface MedicalIndicatorService {

    MedicalIndicatorResponseDTO createMedicalIndicator(MedicalIndicatorRequestDTO request);

    MedicalIndicatorResponseDTO updateMedicalIndicator(Long id, MedicalIndicatorRequestDTO request);

    List<MedicalIndicatorResponseDTO> getMedicalIndicatorByGroupId(Long groupId);

    void deleteMedicalIndicator(Long id);

    List<MedicalIndicator> getMedicalIndicators(CampaignMedicalConfig campaignMedicalConfig);
}
