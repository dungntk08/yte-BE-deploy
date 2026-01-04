package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.entity.MedicalResultDetail;

import java.util.Arrays;
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

    List<MedicalResultDetail> findByCampaignId(Long campaignId);
}