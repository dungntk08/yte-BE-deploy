package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalSubIndicator;

import java.util.List;
import java.util.Optional;

public interface MedicalSubIndicatorRepository extends JpaRepository<MedicalSubIndicator, Long> {
    List<MedicalSubIndicator> findByIndicatorId(Long indicatorId);
    List<MedicalSubIndicator> findByIndicatorIdIn(List<Long> indicatorId);
    boolean existsByIndicator_IdAndSubCode(Long indicatorId, String subCode);
    boolean existsByIndicator_IdAndSubName(Long indicatorId, String subName);
    @Query(value = "SELECT * FROM medical_sub_indicator WHERE campaign_medical_config_id = :campaignMedicalConfigId ORDER BY display_order ASC",
            nativeQuery = true)
    List<MedicalSubIndicator> findByCampaignMedicalConfigIdOrderByDisplayOrderAsc(@Param("campaignMedicalConfigId") Long campaignMedicalConfigId);

    List<MedicalSubIndicator> findByIndicator_IdOrderByDisplayOrderAsc(Long id);

    Optional<MedicalSubIndicator> findBySubNameAndIndicatorId(String subIndicatorName, Long id);
}