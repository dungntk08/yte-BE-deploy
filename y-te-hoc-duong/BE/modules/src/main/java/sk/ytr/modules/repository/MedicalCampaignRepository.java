package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sk.ytr.modules.dto.projections.CampaignOverviewProjection;
import sk.ytr.modules.entity.MedicalCampaign;

public interface MedicalCampaignRepository extends JpaRepository<MedicalCampaign, Long> {
    @Query(value = """
        SELECT 
            total_students AS totalStudents,
            total_students_examined AS totalStudentsExamined
        FROM medical_campaign
        WHERE id = :campaignId
    """, nativeQuery = true)
    CampaignOverviewProjection getCampaignOverview(Long campaignId);
}