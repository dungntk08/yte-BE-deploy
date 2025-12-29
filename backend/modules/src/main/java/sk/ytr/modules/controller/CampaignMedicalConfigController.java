package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.service.CampaignMedicalConfigService;

import java.util.List;

@RestController
@RequestMapping("/api/campaign-medical-configs")
@CrossOrigin
@Slf4j
public class CampaignMedicalConfigController {

    private CampaignMedicalConfigService service;

    @PostMapping
    public CampaignMedicalConfigResponseDTO create(
            @RequestBody CampaignMedicalConfigRequestDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CampaignMedicalConfigResponseDTO update(
            @PathVariable Long id,
            @RequestBody CampaignMedicalConfigRequestDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public CampaignMedicalConfigResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/campaign/{campaignId}")
    public List<CampaignMedicalConfigResponseDTO> getByCampaignId(
            @PathVariable Long campaignId) {
        return service.getByCampaignId(campaignId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
