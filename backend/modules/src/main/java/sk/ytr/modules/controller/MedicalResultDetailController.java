package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.service.MedicalResultDetailService;

import java.util.List;

@RestController
@RequestMapping("/api/medical-result-details")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class MedicalResultDetailController {

    private final MedicalResultDetailService service;

    @PostMapping
    public MedicalResultDetailResponseDTO create(
            @RequestBody MedicalResultDetailRequestDTO request) {
        return service.createMedicalResultDetail(request);
    }

    @PutMapping("/{id}")
    public MedicalResultDetailResponseDTO update(
            @PathVariable Long id,
            @RequestBody MedicalResultDetailRequestDTO request) {
        return service.updateMedicalResultDetail(id, request);
    }

    @GetMapping("/{id}")
    public MedicalResultDetailResponseDTO getById(@PathVariable Long id) {
        return service.getMedicalResultDetailById(id);
    }

    @GetMapping("/student/{studentId}")
    public List<MedicalResultDetailResponseDTO> getByStudentId(
            @PathVariable Long studentId) {
        return service.getMedicalResultDetailByStudentId(studentId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteMedicalResultDetail(id);
    }
}
