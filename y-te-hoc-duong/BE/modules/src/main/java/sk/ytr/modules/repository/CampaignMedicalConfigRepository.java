package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;

import java.util.List;
import java.util.Optional;

public interface CampaignMedicalConfigRepository extends JpaRepository<CampaignMedicalConfig, Long> {
}