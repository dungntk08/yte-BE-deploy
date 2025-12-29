package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.MedicalSubIndicator;
import sk.ytr.modules.repository.CampaignMedicalConfigRepository;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;
import sk.ytr.modules.service.CampaignMedicalConfigService;
import sk.ytr.modules.utils.DateUtils;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class CampaignMedicalConfigServiceImpl implements CampaignMedicalConfigService {

    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final MedicalCampaignRepository campaignRepository;
    private final MedicalSubIndicatorRepository subIndicatorRepository;

    @Override
    public CampaignMedicalConfigResponseDTO create(CampaignMedicalConfigRequestDTO request) {
        try {
            MedicalCampaign campaign = campaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));

            MedicalSubIndicator subIndicator = subIndicatorRepository.findById(request.getSubIndicatorId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ tiêu con"));

            CampaignMedicalConfig entity = CampaignMedicalConfig.builder()
                    .campaign(campaign)
                    .subIndicator(subIndicator)
                    .isRequired(request.getIsRequired())
                    .displayOrder(request.getDisplayOrder())
                    .build();

            campaignMedicalConfigRepository.save(entity);
            return CampaignMedicalConfigResponseDTO.fromEntity(entity);

        } catch (Exception e) {
            log.error("Lỗi tạo cấu hình khám", e);
            throw new RuntimeException("Tạo cấu hình khám thất bại: " + e.getMessage());
        }
    }

    @Override
    public CampaignMedicalConfigResponseDTO update(Long id, CampaignMedicalConfigRequestDTO request) {
        try {
            CampaignMedicalConfig entity = campaignMedicalConfigRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình khám"));

            entity.setIsRequired(request.getIsRequired());
            entity.setDisplayOrder(request.getDisplayOrder());

            campaignMedicalConfigRepository.save(entity);
            return CampaignMedicalConfigResponseDTO.fromEntity(entity);

        } catch (Exception e) {
            log.error("Lỗi cập nhật cấu hình khám", e);
            throw new RuntimeException("Cập nhật cấu hình khám thất bại");
        }
    }

    @Override
    public CampaignMedicalConfigResponseDTO getById(Long id) {
        CampaignMedicalConfig entity = campaignMedicalConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình khám"));
        return CampaignMedicalConfigResponseDTO.fromEntity(entity);
    }

    @Override
    public void delete(Long id) {
        try {
            campaignMedicalConfigRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Xóa cấu hình khám thất bại");
        }
    }

    @Override
    public List<CampaignMedicalConfigResponseDTO> getByCampaignId(Long campaignId) {
        return campaignMedicalConfigRepository.findByCampaignId(campaignId)
                .stream()
                .map(CampaignMedicalConfigResponseDTO::fromEntity)
                .toList();
    }
}
