package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;

import java.util.List;

public interface MedicalIndicatorService {

    MedicalIndicatorResponseDTO createMedicalIndicator(MedicalIndicatorRequestDTO request);

    MedicalIndicatorResponseDTO updateMedicalIndicator(Long id, MedicalIndicatorRequestDTO request);

    List<MedicalIndicatorResponseDTO> getMedicalIndicatorByGroupId(Long groupId);

    void deleteMedicalIndicator(Long id);
}
