package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.entity.MedicalSubIndicator;

import java.util.List;

public interface MedicalSubIndicatorService {

    MedicalSubIndicatorResponseDTO createMedicalSubIndicator(MedicalSubIndicatorRequestDTO request);

    MedicalSubIndicatorResponseDTO updateMedicalSubIndicator(Long id, MedicalSubIndicatorRequestDTO request);

    MedicalSubIndicatorResponseDTO getMedicalSubIndicatorById(Long id);

    void deleteMedicalSubIndicator(Long id);

    List<MedicalSubIndicatorResponseDTO> getMedicalSubIndicatorByIndicatorId(Long indicatorId);

    List<MedicalSubIndicator> getMedicalSubIndicators(List<MedicalIndicator> indicators);
}
