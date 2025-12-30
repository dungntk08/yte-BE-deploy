package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.MedicalGroupRequestDTO;
import sk.ytr.modules.dto.response.MedicalGroupResponseDTO;
import sk.ytr.modules.service.MedicalGroupService;

import java.util.List;

@RestController
@RequestMapping("/api/medical-groups")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class MedicalGroupController {

    private final MedicalGroupService service;

    @PostMapping
    public MedicalGroupResponseDTO create(
            @RequestBody MedicalGroupRequestDTO request) {
        return service.createMedicalGroup(request);
    }

    @PutMapping("/{id}")
    public MedicalGroupResponseDTO update(
            @PathVariable Long id,
            @RequestBody MedicalGroupRequestDTO request) {
        return service.updateMedicalGroup(id, request);
    }

    @GetMapping
    public List<MedicalGroupResponseDTO> getAll() {
        return service.getAllMedicalGroup();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteMedicalGroup(id);
    }
}
