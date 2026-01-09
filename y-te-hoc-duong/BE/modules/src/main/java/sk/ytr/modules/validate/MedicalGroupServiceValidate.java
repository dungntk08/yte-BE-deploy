package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.MedicalGroupRequestDTO;
import sk.ytr.modules.repository.MedicalGroupRepository;

@Component
@RequiredArgsConstructor
public class MedicalGroupServiceValidate {

    private final MedicalGroupRepository medicalGroupRepository;

    public void validateCreateRequest(MedicalGroupRequestDTO request) {

        if (request.getGroupCode() == null || request.getGroupCode().isBlank()) {
            throw new IllegalArgumentException("mã nhóm không được để trống");
        }

        if (request.getGroupName() == null || request.getGroupName().isBlank()) {
            throw new IllegalArgumentException("tên nhóm không được để trống");
        }

        if (medicalGroupRepository.existsByGroupCode(request.getGroupCode().trim())) {
            throw new IllegalArgumentException(
                    "Mã nhóm '" + request.getGroupCode() + "' đã tồn tại"
            );
        }

        if (medicalGroupRepository.existsByGroupName(request.getGroupName().trim())) {
            throw new IllegalArgumentException(
                    "Tên nhóm '" + request.getGroupName() + "' đã tồn tại"
            );
        }
    }
}

