package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.repository.MedicalGroupRepository;
import sk.ytr.modules.repository.MedicalIndicatorRepository;

@Component
@RequiredArgsConstructor
public class MedicalIndicatorServiceValidate {

    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalGroupRepository medicalGroupRepository;

    public void validateCreateRequest(MedicalIndicatorRequestDTO request) {

        if (request.getGroupId() == null) {
            throw new IllegalArgumentException("nhóm chỉ tiêu không được để trống");
        }

        if (request.getIndicatorCode() == null || request.getIndicatorCode().isBlank()) {
            throw new IllegalArgumentException("mã chỉ tiêu không được để trống");
        }

        if (request.getIndicatorName() == null || request.getIndicatorName().isBlank()) {
            throw new IllegalArgumentException("tên chỉ tiêu không được để trống");
        }

        if (!medicalGroupRepository.existsById(request.getGroupId())) {
            throw new IllegalArgumentException("nhóm chỉ tiêu không tồn tại");
        }

        if (medicalIndicatorRepository.existsByIndicatorCode(request.getIndicatorCode().trim())) {
            throw new IllegalArgumentException(
                    "Mã chỉ tiêu '" + request.getIndicatorCode() + "' đã tồn tại"
            );
        }

        boolean nameExists = medicalIndicatorRepository
                .existsByGroup_IdAndIndicatorName(
                        request.getGroupId(),
                        request.getIndicatorName().trim()
                );

        if (nameExists) {
            throw new IllegalArgumentException(
                    "Tên chỉ tiêu '" + request.getIndicatorName()
                            + "' đã tồn tại trong nhóm"
            );
        }
    }
}
