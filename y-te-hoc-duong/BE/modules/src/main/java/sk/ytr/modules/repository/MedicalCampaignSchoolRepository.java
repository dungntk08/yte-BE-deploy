package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sk.ytr.modules.dto.projections.SchoolStatisticProjection;
import sk.ytr.modules.entity.MedicalCampaignSchool;
import sk.ytr.modules.entity.MedicalGroup;

import java.util.List;

public interface MedicalCampaignSchoolRepository extends JpaRepository<MedicalCampaignSchool, Long> {

    List<MedicalCampaignSchool> findByMedicalCampaignId(Long medicalCampaignId);

    @Query(value = """
                SELECT COUNT(*) > 0
                FROM medical_campaign_school mcs
                WHERE mcs.medical_campaign_id = :medicalCampaignId
                  AND mcs.medical_group_id = :medicalGroupId
            """, nativeQuery = true)
    Boolean existsByMedicalCampaignAndMedicalGroup(
            Long medicalCampaignId,
            Long medicalGroupId
    );

    @Query(value = """
                SELECT
                    s.id AS schoolId,
                    s.school_name AS schoolName,
                    COUNT(st.id) AS totalStudents,
                    COUNT(st.id) FILTER (WHERE st.campaign_id = :campaignId) AS examinedStudents
                FROM medical_campaign_school mcs
                JOIN school s ON s.id = mcs.school_id
                LEFT JOIN student st 
                       ON st.school_id = s.id
                      AND st.campaign_id = :campaignId
                WHERE mcs.medical_campaign_id = :campaignId
                GROUP BY s.id, s.school_name
                ORDER BY s.school_name
            """, nativeQuery = true)
    List<SchoolStatisticProjection> statisticByCampaign(Long campaignId);
}
