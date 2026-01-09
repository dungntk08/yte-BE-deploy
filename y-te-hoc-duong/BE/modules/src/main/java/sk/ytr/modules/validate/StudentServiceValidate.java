package sk.ytr.modules.validate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.StudentRepository;

@Component
@RequiredArgsConstructor
public class StudentServiceValidate {

    private final StudentRepository studentRepository;
    private final MedicalCampaignRepository medicalCampaignRepository;

    public void validateCreateRequest(StudentRequestDTO request) {

        if (request.getCampaignId() == null) {
            throw new IllegalArgumentException("đợt khám không được để trống");
        }

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("họ tên học sinh không được để trống");
        }

        if (request.getGender() == null) {
            throw new IllegalArgumentException("giới tính không được để trống");
        }

        if (request.getDob() == null) {
            throw new IllegalArgumentException("ngày sinh không được để trống");
        }

        if (request.getIdentityNumber() == null || request.getIdentityNumber().isBlank()) {
            throw new IllegalArgumentException("CCCD / mã định danh không được để trống");
        }

        if (!medicalCampaignRepository.existsById(request.getCampaignId())) {
            throw new IllegalArgumentException("đợt khám không tồn tại");
        }

        boolean exists = studentRepository.existsByCampaign_IdAndIdentityNumber(
                request.getCampaignId(),
                request.getIdentityNumber().trim()
        );

        if (exists) {
            throw new IllegalArgumentException(
                    "Học sinh với mã định danh '" + request.getIdentityNumber()
                            + "' đã tồn tại trong đợt khám"
            );
        }
    }
}

