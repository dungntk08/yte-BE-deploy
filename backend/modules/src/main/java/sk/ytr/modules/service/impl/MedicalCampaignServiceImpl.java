package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.School;
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
    @Override
    public MedicalCampaignResponseDTO create(MedicalCampaignRequestDTO request) {
        try {

            campaignMedicalServiceValidate.validateCreateRequest(request);
            School school = schoolRepository.findById(request.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy trường"));

            MedicalCampaign campaign = MedicalCampaign.builder()
                    .school(school)
                    .schoolYear(request.getSchoolYear())
                    .campaignName(request.getCampaignName())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .status(request.getStatus())
                    .note(request.getNote())
                    .totalStudents(request.getTotalStudents())
                    .totalStudentsExamined(request.getTotalStudentsExamined())
                    .build();

            campaign.setCreatedBy("ADMIN"); // tạm thời
            campaign.setCreatedDate(DateUtils.getNow());
            campaign.setUpdatedBy("ADMIN"); // tạm thời
            campaign.setModifiedDate(DateUtils.getNow());

            medicalCampaignRepository.save(campaign);
            return MedicalCampaignResponseDTO.fromEntity(campaign);

        } catch (Exception e) {
            log.error("Lỗi tạo đợt khám", e);
            throw new RuntimeException("Tạo đợt khám thất bại " + e.getMessage());
        }
    }

    @Override
    public MedicalCampaignResponseDTO update(Long id, MedicalCampaignRequestDTO request) {
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
            throw new RuntimeException("Cập nhật đợt khám thất bại");
        }
    }

    @Override
    public MedicalCampaignResponseDTO getById(Long id) {
        return medicalCampaignRepository.findById(id)
                .map(MedicalCampaignResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khám"));
    }

    @Override
    public List<MedicalCampaignResponseDTO> getAll() {
        return medicalCampaignRepository.findAll()
                .stream()
                .map(MedicalCampaignResponseDTO::fromEntity)
                .toList();
    }

    @Override
    public void delete(Long id) {
        try {
            medicalCampaignRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa đợt khám");
        }
    }
}
