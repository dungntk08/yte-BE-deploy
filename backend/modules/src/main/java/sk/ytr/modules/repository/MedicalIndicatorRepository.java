package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalIndicator;

import java.util.List;

public interface MedicalIndicatorRepository extends JpaRepository<MedicalIndicator, Long> {
    List<MedicalIndicator> findByGroupId(Long groupId);
    List<MedicalIndicator> findByGroup_IdIn(List<Long> groupIds);
    boolean existsByIndicatorCode(String indicatorCode);
    boolean existsByGroup_IdAndIndicatorName(Long groupId, String indicatorName);
}