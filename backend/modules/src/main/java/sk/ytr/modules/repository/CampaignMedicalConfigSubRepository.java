package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.entity.CampaignMedicalConfigSub;

import java.util.List;

public interface CampaignMedicalConfigSubRepository extends JpaRepository<CampaignMedicalConfigSub, Long> {
    List<CampaignMedicalConfigSub> findByCampaignMedicalConfig_IdOrderByDisplayOrderAsc(Long campaignMedicalConfigId);

    @Query(value = "SELECT * FROM campaign_medical_config_sub WHERE campaign_id = :campaignId ORDER BY display_order ASC", nativeQuery = true)
    List<CampaignMedicalConfigSub> findByCampaignIdOrderByDisplayOrderAsc(@Param("campaignId") Long campaignId);
}
