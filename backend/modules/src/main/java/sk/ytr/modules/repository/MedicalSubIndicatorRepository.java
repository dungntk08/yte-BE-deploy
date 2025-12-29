package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalSubIndicator;

import java.util.List;

public interface MedicalSubIndicatorRepository extends JpaRepository<MedicalSubIndicator, Long> {
    List<MedicalSubIndicator> findByIndicatorId(Long indicatorId);
    boolean existsByIndicator_IdAndSubCode(Long indicatorId, String subCode);
    boolean existsByIndicator_IdAndSubName(Long indicatorId, String subName);
}