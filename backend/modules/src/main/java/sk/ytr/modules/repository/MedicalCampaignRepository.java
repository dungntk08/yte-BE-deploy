package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.MedicalCampaign;

public interface MedicalCampaignRepository extends JpaRepository<MedicalCampaign, Long> {
    boolean existsBySchool_IdAndSchoolYearAndCampaignName(
            Long schoolId,
            String schoolYear,
            String campaignName
    );
}