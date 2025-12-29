package sk.ytr.modules.validate;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.SchoolRepository;

@Slf4j
@AllArgsConstructor
public class CampaignMedicalServiceValidate {

    private final MedicalCampaignRepository medicalCampaignRepository;
    private final SchoolRepository schoolRepository;

    public void validateCreateRequest(MedicalCampaignRequestDTO request) {

        if (request.getSchoolId() == null) {
            throw new IllegalArgumentException("trường học không được để trống");
        }

        if (request.getSchoolYear() == null || request.getSchoolYear().isBlank()) {
            throw new IllegalArgumentException("năm học không được để trống");
        }

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

        // ===== VALIDATE TRÙNG TÊN ĐỢT KHÁM =====
        boolean exists = medicalCampaignRepository
                .existsBySchool_IdAndSchoolYearAndCampaignName(
                        request.getSchoolId(),
                        request.getSchoolYear(),
                        request.getCampaignName().trim()
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "Tên đợt khám '" + request.getCampaignName()
                            + "' đã tồn tại trong năm học " + request.getSchoolYear()
            );
        }
    }

}
