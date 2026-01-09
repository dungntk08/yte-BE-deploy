package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;

import java.util.List;

public interface MedicalCampaignService {

    MedicalCampaignResponseDTO createMedicalCampaign(MedicalCampaignRequestDTO request);

    MedicalCampaignResponseDTO updateMedicalCampaign(Long id, MedicalCampaignRequestDTO request);

    MedicalCampaignResponseDTO getMedicalCampaignById(Long id);

    List<MedicalCampaignResponseDTO> getAllMedicalCampaign();

    void deleteMedicalCampaign(Long id);


}

