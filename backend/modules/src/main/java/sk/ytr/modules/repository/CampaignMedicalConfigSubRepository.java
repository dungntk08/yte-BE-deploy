package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.CampaignMedicalConfigSub;

import java.util.List;

public interface CampaignMedicalConfigSubRepository extends JpaRepository<CampaignMedicalConfigSub, Long> {
    List<CampaignMedicalConfigSub> findByCampaignMedicalConfig_IdOrderByDisplayOrderAsc(Long campaignMedicalConfigId);
}
