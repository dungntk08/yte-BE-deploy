package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalGroupRequestDTO;
import sk.ytr.modules.dto.response.MedicalGroupResponseDTO;

import java.util.List;

public interface MedicalGroupService {

    MedicalGroupResponseDTO createMedicalGroup(MedicalGroupRequestDTO request);

    MedicalGroupResponseDTO updateMedicalGroup(Long id, MedicalGroupRequestDTO request);

    List<MedicalGroupResponseDTO> getAllMedicalGroup();

    void deleteMedicalGroup(Long id);
}
