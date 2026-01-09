package sk.ytr.modules.validate;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.SchoolRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class CampaignMedicalServiceValidate {

    private final MedicalCampaignRepository medicalCampaignRepository;
    private final SchoolRepository schoolRepository;

    public void validateCreateRequest(MedicalCampaignRequestDTO request) {

        if (request.getCampaignName() == null || request.getCampaignName().isBlank()) {
            throw new IllegalArgumentException("tên kỳ kiểm tra sức khỏe không được để trống");
        }

        if (request.getStatus() == null) {
            throw new IllegalArgumentException("status không được để trống");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("ngày bắt đầu và ngày kết thúc không được để trống");
        }

        if (request.getStartDate().after(request.getEndDate())) {
            throw new IllegalArgumentException("ngày bắt đầu không được lớn hơn ngày kết thúc");
        }
    }

}
