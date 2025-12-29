package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.service.MedicalSubIndicatorService;

import java.util.List;
@RestController
@RequestMapping("/api/medical-sub-indicators")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class MedicalSubIndicatorController {

    private final MedicalSubIndicatorService service;

    @PostMapping
    public MedicalSubIndicatorResponseDTO create(
            @RequestBody MedicalSubIndicatorRequestDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MedicalSubIndicatorResponseDTO update(
            @PathVariable Long id,
            @RequestBody MedicalSubIndicatorRequestDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public MedicalSubIndicatorResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/indicator/{indicatorId}")
    public List<MedicalSubIndicatorResponseDTO> getByIndicatorId(
            @PathVariable Long indicatorId) {
        return service.getByIndicatorId(indicatorId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
