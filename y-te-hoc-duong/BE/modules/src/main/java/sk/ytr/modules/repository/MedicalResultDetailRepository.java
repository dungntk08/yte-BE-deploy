package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.dto.projections.DiseaseStatisticProjection;
import sk.ytr.modules.dto.projections.StudentYearStatisticProjection;
import sk.ytr.modules.entity.MedicalResultDetail;

import java.util.List;
import java.util.Optional;

public interface MedicalResultDetailRepository extends JpaRepository<MedicalResultDetail, Long> {
    List<MedicalResultDetail> findByStudentId(Long studentId);

    Optional<MedicalResultDetail> findByStudentIdAndCampaignIdAndMedicalGroupIdAndMedicalIndicatorIdAndMedicalSubIndicatorId(
            Long studentId,
            Long campaignId,
            Long medicalGroupId,
            Long medicalIndicatorId,
            Long medicalSubIndicatorId
    );

    List<MedicalResultDetail> findByStudentIdAndCampaignId(Long id, Long campaignId);

    @Query("""
            SELECT m
            FROM MedicalResultDetail m
            WHERE m.campaign.id = :campaignId
            """)
    List<MedicalResultDetail> findByCampaignId(@Param("campaignId") Long campaignId);

    @Query(value = """
                SELECT
                    mg.id AS groupId,
                    mg.group_name AS groupName,
            
                    mi.id AS indicatorId,
                    mi.indicator_name AS indicatorName,
            
                    msi.id AS subIndicatorId,
                    msi.sub_name AS subIndicatorName,
            
                    COUNT(*) AS totalStudentAffected
                FROM medical_result_detail mrd
                JOIN medical_indicator mi
                     ON mi.id = mrd.medical_indicator_id
                JOIN medical_group mg
                     ON mg.id = mrd.medical_group_id
                LEFT JOIN medical_sub_indicator msi
                     ON msi.id = mrd.medical_sub_indicator_id
                WHERE mrd.campaign_id = :campaignId
                  AND mrd.result_value = TRUE
                GROUP BY
                    mg.id, mg.group_name,
                    mi.id, mi.indicator_name,
                    msi.id, msi.sub_name
                ORDER BY totalStudentAffected DESC
            """, nativeQuery = true)
    List<DiseaseStatisticProjection> statisticDiseaseByCampaign(Long campaignId);


    @Query(value = """
                SELECT
                    mc.school_year AS schoolYear,
                    COUNT(mrd.id) AS totalDiseaseCount
                FROM medical_result_detail mrd
                JOIN medical_campaign mc
                     ON mc.id = mrd.campaign_id
                WHERE mrd.student_id = :studentId
                  AND mrd.result_value = TRUE
                GROUP BY mc.school_year
                ORDER BY mc.school_year
            """, nativeQuery = true)
    List<StudentYearStatisticProjection> statisticStudentByYears(Long studentId);
}