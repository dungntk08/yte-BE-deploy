package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;

import java.util.List;

public interface CampaignMedicalConfigRepository extends JpaRepository<CampaignMedicalConfig, Long> {
    List<CampaignMedicalConfig> findByCampaignId(Long campaignId);
    boolean existsByCampaign_IdAndSubIndicator_Id(Long campaignId, Long subIndicatorId);
}