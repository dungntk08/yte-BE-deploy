package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.School;
import sk.ytr.modules.repository.CampaignMedicalConfigRepository;
import sk.ytr.modules.repository.MedicalCampaignRepository;
import sk.ytr.modules.repository.SchoolRepository;
import sk.ytr.modules.service.MedicalCampaignService;
import sk.ytr.modules.utils.DateUtils;
import sk.ytr.modules.validate.CampaignMedicalServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalCampaignServiceImpl implements MedicalCampaignService {

    private final MedicalCampaignRepository medicalCampaignRepository;
    private final SchoolRepository schoolRepository;
    private final CampaignMedicalServiceValidate campaignMedicalServiceValidate;
    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    /**
     * Tạo mới một đợt khám y tế.
     *
     * @param request DTO chứa thông tin đợt khám cần tạo.
     * @return DTO phản hồi chứa thông tin đợt khám vừa được tạo.
     */
    @Override
    public MedicalCampaignResponseDTO createMedicalCampaign(MedicalCampaignRequestDTO request) {
        try {
            campaignMedicalServiceValidate.validateCreateRequest(request);
            // Lấy cấu hình chỉ tiêu khám mặc định (giả sử ID = 1)
            CampaignMedicalConfig config = campaignMedicalConfigRepository.findById(1L).orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình chỉ tiêu khám"));

            MedicalCampaign campaign = MedicalCampaign.builder()
                    .schoolYear(request.getSchoolYear())
                    .campaignName(request.getCampaignName())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .status(request.getStatus())
                    .note(request.getNote())
                    .totalStudents(request.getTotalStudents())
                    .totalStudentsExamined(request.getTotalStudentsExamined())
                    .campaignMedicalConfig(config)
                    .build();

            campaign.setCreatedBy("ADMIN"); // tạm thời
            campaign.setCreatedDate(DateUtils.getNow());
            campaign.setUpdatedBy("ADMIN"); // tạm thời
            campaign.setModifiedDate(DateUtils.getNow());

            medicalCampaignRepository.save(campaign);
            return MedicalCampaignResponseDTO.fromEntity(campaign);
        } catch (Exception e) {
            log.error("Lỗi tạo đợt khám", e);
            throw new RuntimeException("Tạo đợt khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Cập nhật thông tin một đợt khám y tế.
     *
     * @param id      ID của đợt khám cần cập nhật.
     * @param request DTO chứa thông tin cập nhật.
     * @return DTO phản hồi chứa thông tin đợt khám sau khi cập nhật.
     */
    @Override
    public MedicalCampaignResponseDTO updateMedicalCampaign(Long id, MedicalCampaignRequestDTO request) {
        try {
            campaignMedicalServiceValidate.validateCreateRequest(request);
            MedicalCampaign campaign = medicalCampaignRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));

            campaign.setCampaignName(request.getCampaignName());
            campaign.setStartDate(request.getStartDate());
            campaign.setEndDate(request.getEndDate());
            campaign.setStatus(request.getStatus());
            campaign.setNote(request.getNote());
            campaign.setUpdatedBy("ADMIN"); // tạm thời
            campaign.setModifiedDate(DateUtils.getNow());

            medicalCampaignRepository.save(campaign);
            return MedicalCampaignResponseDTO.fromEntity(campaign);
        } catch (Exception e) {
            log.error("Lỗi cập nhật đợt khám", e);
            throw new RuntimeException("Cập nhật đợt khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Lấy thông tin chi tiết của một đợt khám y tế theo ID.
     *
     * @param id ID của đợt khám.
     * @return DTO phản hồi chứa thông tin chi tiết của đợt khám.
     */
    @Override
    public MedicalCampaignResponseDTO getMedicalCampaignById(Long id) {
        try {
            return medicalCampaignRepository.findById(id)
                    .map(MedicalCampaignResponseDTO::fromEntity)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));
        } catch (Exception e) {
            log.error("Lỗi lấy thông tin đợt khám", e);
            throw new RuntimeException("Không thể lấy thông tin đợt khám: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách tất cả các đợt khám y tế.
     *
     * @return Danh sách DTO phản hồi chứa thông tin các đợt khám.
     */
    @Override
    public List<MedicalCampaignResponseDTO> getAllMedicalCampaign() {
        try {
            return medicalCampaignRepository.findAll()
                    .stream()
                    .map(MedicalCampaignResponseDTO::fromEntity)
                    .toList();
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách đợt khám", e);
            throw new RuntimeException("Không thể lấy danh sách đợt khám: " + e.getMessage());
        }
    }

    /**
     * Xóa một đợt khám y tế theo ID.
     *
     * @param id ID của đợt khám cần xóa.
     */
    @Override
    public void deleteMedicalCampaign(Long id) {
        try {
            medicalCampaignRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi xóa đợt khám", e);
            throw new RuntimeException("Không thể xóa đợt khám: " + e.getMessage());
        }
    }

}
