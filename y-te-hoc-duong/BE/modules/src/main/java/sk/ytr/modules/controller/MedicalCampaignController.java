package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;
import sk.ytr.modules.service.MedicalCampaignService;

import java.util.List;
@RestController
@RequestMapping("/api/medical-campaigns")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class MedicalCampaignController {

    private final MedicalCampaignService service;

    @PostMapping
    public MedicalCampaignResponseDTO create(
            @RequestBody MedicalCampaignRequestDTO request) {
        return service.createMedicalCampaign(request);
    }

    @PutMapping("/{id}")
    public MedicalCampaignResponseDTO update(
            @PathVariable Long id,
            @RequestBody MedicalCampaignRequestDTO request) {
        return service.updateMedicalCampaign(id, request);
    }

    @GetMapping("/{id}")
    public MedicalCampaignResponseDTO getById(@PathVariable Long id) {
        return service.getMedicalCampaignById(id);
    }

    @GetMapping
    public List<MedicalCampaignResponseDTO> getAll() {
        return service.getAllMedicalCampaign();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteMedicalCampaign(id);
    }
}
