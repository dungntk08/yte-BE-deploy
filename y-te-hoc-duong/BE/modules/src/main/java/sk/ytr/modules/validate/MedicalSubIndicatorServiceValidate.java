package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.repository.MedicalIndicatorRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;

@Component
@RequiredArgsConstructor
public class MedicalSubIndicatorServiceValidate {

    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;

    public void validateCreateRequest(MedicalSubIndicatorRequestDTO request) {

        if (request.getIndicatorId() == null) {
            throw new IllegalArgumentException("chỉ tiêu cha không được để trống");
        }

        if (request.getSubCode() == null || request.getSubCode().isBlank()) {
            throw new IllegalArgumentException("mã chỉ tiêu con không được để trống");
        }

        if (request.getSubName() == null || request.getSubName().isBlank()) {
            throw new IllegalArgumentException("tên chỉ tiêu con không được để trống");
        }

        if (!medicalIndicatorRepository.existsById(request.getIndicatorId())) {
            throw new IllegalArgumentException("chỉ tiêu cha không tồn tại");
        }

        if (medicalSubIndicatorRepository.existsByIndicator_IdAndSubCode(
                request.getIndicatorId(),
                request.getSubCode().trim()
        )) {
            throw new IllegalArgumentException(
                    "Mã chỉ tiêu con '" + request.getSubCode() + "' đã tồn tại"
            );
        }

        if (medicalSubIndicatorRepository.existsByIndicator_IdAndSubName(
                request.getIndicatorId(),
                request.getSubName().trim()
        )) {
            throw new IllegalArgumentException(
                    "Tên chỉ tiêu con '" + request.getSubName() + "' đã tồn tại"
            );
        }
    }
}
