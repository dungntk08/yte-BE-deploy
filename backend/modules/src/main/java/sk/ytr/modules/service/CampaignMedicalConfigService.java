package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.request.CampaignMedicalConfigSubRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigSubResponseDTO;

import java.util.List;

public interface CampaignMedicalConfigService {
    CampaignMedicalConfigResponseDTO createCampaignMedicalConfig(CampaignMedicalConfigRequestDTO request);

    CampaignMedicalConfigResponseDTO updateCampaignMedicalConfig(Long id, CampaignMedicalConfigRequestDTO request);

    CampaignMedicalConfigResponseDTO getCampaignMedicalConfigById(Long id);

    void deleteCampaignMedicalConfig(Long id);

    /** Tạo mới cấu hình nhóm chỉ tiêu */
    CampaignMedicalConfigSubResponseDTO createCampaignMedicalConfigSub(CampaignMedicalConfigSubRequestDTO request);

    /** Cập nhật cấu hình nhóm chỉ tiêu */
    CampaignMedicalConfigSubResponseDTO updateCampaignMedicalConfigSub(Long id, CampaignMedicalConfigSubRequestDTO request);

    /** Lấy chi tiết theo ID */
    CampaignMedicalConfigSubResponseDTO getCampaignMedicalConfigSubById(Long id);

    /** Xóa cấu hình */
    void deleteCampaignMedicalConfigSub(Long id);

    /** Lấy danh sách theo cấu hình đợt khám */
    List<CampaignMedicalConfigSubResponseDTO> getByCampaignMedicalConfigId(Long campaignMedicalConfigId);

}
