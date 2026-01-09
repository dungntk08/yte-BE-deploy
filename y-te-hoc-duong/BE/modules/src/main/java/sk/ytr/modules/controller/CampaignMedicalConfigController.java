package sk.ytr.modules.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.request.CampaignMedicalConfigSubRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigSubResponseDTO;
import sk.ytr.modules.service.CampaignMedicalConfigService;

import java.util.List;

@RestController
@RequestMapping("/api/campaign-medical-configs")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class CampaignMedicalConfigController {

    private final CampaignMedicalConfigService service;

    @PostMapping
    public CampaignMedicalConfigResponseDTO create(
            @RequestBody CampaignMedicalConfigRequestDTO request) {
        return service.createCampaignMedicalConfig(request);
    }

    @PutMapping("/{id}")
    public CampaignMedicalConfigResponseDTO update(
            @PathVariable Long id,
            @RequestBody CampaignMedicalConfigRequestDTO request) {
        return service.updateCampaignMedicalConfig(id, request);
    }

    @GetMapping("/{id}")
    public CampaignMedicalConfigResponseDTO getById(@PathVariable Long id) {
        return service.getCampaignMedicalConfigById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteCampaignMedicalConfig(id);
    }

    /**
     * Tạo mới cấu hình nhóm chỉ tiêu khám
     */
    @PostMapping("/createCampaignMedicalConfigSub")
    public CampaignMedicalConfigSubResponseDTO createCampaignMedicalConfigSub(
            @RequestBody CampaignMedicalConfigSubRequestDTO request) {

        return service.createCampaignMedicalConfigSub(request);
    }

    /**
     * Cập nhật cấu hình nhóm chỉ tiêu khám
     */
    @PutMapping("updateCampaignMedicalConfigSub/{id}")
    public CampaignMedicalConfigSubResponseDTO updateCampaignMedicalConfigSub(
            @PathVariable Long id,
            @Valid @RequestBody CampaignMedicalConfigSubRequestDTO request) {

        return service.updateCampaignMedicalConfigSub(id, request);
    }

    /**
     * Lấy chi tiết cấu hình nhóm chỉ tiêu theo ID
     */
    @GetMapping("getCampaignMedicalConfigSubById/{id}")
    public CampaignMedicalConfigSubResponseDTO getCampaignMedicalConfigSubById(@PathVariable Long id) {
        return service.getCampaignMedicalConfigSubById(id);
    }

    /**
     * Lấy danh sách cấu hình nhóm chỉ tiêu theo cấu hình đợt khám
     */
    @GetMapping("getByCampaignMedicalConfigId/config/{campaignMedicalConfigId}")
    public List<CampaignMedicalConfigSubResponseDTO> getByCampaignMedicalConfigId(
            @PathVariable Long campaignMedicalConfigId) {

        return service.getByCampaignMedicalConfigId(campaignMedicalConfigId);
    }

    /**
     * Lấy danh sách cấu hình nhóm chỉ tiêu theo cấu hình đợt khám
     */
    @GetMapping("getByCampaignId/config/{campaignId}")
    public List<CampaignMedicalConfigSubResponseDTO> getByCampaignId(
            @PathVariable Long campaignId) {

        return service.getByCampaignId(campaignId);
    }

    /**
     * Xóa cấu hình nhóm chỉ tiêu khám
     */
    @DeleteMapping("deleteCampaignMedicalConfigSub/{id}")
    public void deleteCampaignMedicalConfigSub(@PathVariable Long id) {
        service.deleteCampaignMedicalConfigSub(id);
    }
}
