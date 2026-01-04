package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalIndicator;

import java.util.List;
import java.util.Optional;

public interface MedicalIndicatorRepository extends JpaRepository<MedicalIndicator, Long> {
    List<MedicalIndicator> findByGroupId(Long groupId);

    List<MedicalIndicator> findByGroup_IdIn(List<Long> groupIds);

    boolean existsByIndicatorCode(String indicatorCode);

    boolean existsByGroup_IdAndIndicatorName(Long groupId, String indicatorName);

    @Query("""
                select distinct mi
                from CampaignMedicalConfigSub cms
                    join cms.medicalGroup mg
                    join MedicalIndicator mi on mi.group = mg
                where cms.campaignMedicalConfig.id = :campaignMedicalConfigId
                order by mi.displayOrder
            """ )
    List<MedicalIndicator> findIndicatorsByCampaignMedicalConfigId(
            @Param("campaignMedicalConfigId") Long campaignMedicalConfigId
    );

    List<MedicalIndicator> findByGroup_IdOrderByDisplayOrderAsc(Long id);

    Optional<MedicalIndicator> findByIndicatorNameAndGroupId(String indicatorName, Long id);
}