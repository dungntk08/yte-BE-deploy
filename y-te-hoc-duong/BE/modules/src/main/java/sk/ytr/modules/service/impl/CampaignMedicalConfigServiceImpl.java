package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.request.CampaignMedicalConfigSubRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigSubResponseDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.CampaignMedicalConfigService;
import sk.ytr.modules.utils.DateUtils;
import sk.ytr.modules.validate.CampaignMedicalConfigServiceValidate;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class CampaignMedicalConfigServiceImpl implements CampaignMedicalConfigService {

    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final MedicalGroupRepository medicalGroupRepository;
    private final MedicalCampaignRepository campaignRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorRepository subIndicatorRepository;
    private final CampaignMedicalConfigServiceValidate campaignMedicalConfigServiceValidate;
    private final CampaignMedicalConfigSubRepository configSubRepository;

    /**
     * Tạo mới cấu hình khám.
     *
     * @param request DTO chứa thông tin yêu cầu tạo mới cấu hình khám.
     * @return DTO chứa thông tin cấu hình khám vừa được tạo.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public CampaignMedicalConfigResponseDTO createCampaignMedicalConfig(CampaignMedicalConfigRequestDTO request) {
        try {
            campaignMedicalConfigServiceValidate.validateCreateRequest(request);

            CampaignMedicalConfig entity = CampaignMedicalConfig.builder()
                    .configName(request.getConfigName())
                    .build();

            campaignMedicalConfigRepository.save(entity);
            return CampaignMedicalConfigResponseDTO.fromEntity(entity);

        } catch (Exception e) {
            log.error("Lỗi tạo cấu hình khám", e);
            throw new RuntimeException("Tạo cấu hình khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Cập nhật cấu hình khám.
     *
     * @param id      ID của cấu hình khám cần cập nhật.
     * @param request DTO chứa thông tin yêu cầu cập nhật cấu hình khám.
     * @return DTO chứa thông tin cấu hình khám sau khi được cập nhật.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public CampaignMedicalConfigResponseDTO updateCampaignMedicalConfig(Long id, CampaignMedicalConfigRequestDTO request) {
        try {
            campaignMedicalConfigServiceValidate.validateCreateRequest(request);
            CampaignMedicalConfig entity = campaignMedicalConfigRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình khám"));

            campaignMedicalConfigRepository.save(entity);
            return CampaignMedicalConfigResponseDTO.fromEntity(entity);

        } catch (Exception e) {
            log.error("Lỗi cập nhật cấu hình khám", e);
            throw new RuntimeException("Cập nhật cấu hình khám thất bại: " + e.getMessage());
        }
    }

    /** Lấy chi tiết theo ID */
    @Override
    public CampaignMedicalConfigResponseDTO getCampaignMedicalConfigById(Long id) {
        CampaignMedicalConfig entity = campaignMedicalConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình khám"));
        return CampaignMedicalConfigResponseDTO.fromEntity(entity);
    }

    /** Xóa cấu hình */
    @Override
    public void deleteCampaignMedicalConfig(Long id) {
        try {
            campaignMedicalConfigRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Xóa cấu hình khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Tạo mới cấu hình nhóm chỉ tiêu.
     *
     * Phương thức này thực hiện các bước sau:
     * 1. Kiểm tra sự tồn tại của cấu hình đợt khám và nhóm chỉ tiêu.
     * 2. Tạo mới một thực thể `CampaignMedicalConfigSub` với thông tin từ request.
     * 3. Lưu thực thể vào cơ sở dữ liệu.
     * 4. Trả về DTO chứa thông tin của thực thể vừa tạo.
     *
     * @param request DTO chứa thông tin yêu cầu tạo mới cấu hình nhóm chỉ tiêu.
     * @return DTO chứa thông tin cấu hình nhóm chỉ tiêu vừa được tạo.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public CampaignMedicalConfigSubResponseDTO createCampaignMedicalConfigSub(CampaignMedicalConfigSubRequestDTO request) {
        try {
            CampaignMedicalConfig campaignConfig = campaignMedicalConfigRepository.findById(request.getCampaignMedicalConfigId())
                    .orElseThrow(() -> new IllegalArgumentException("Cấu hình đợt khám không tồn tại"));

            MedicalGroup medicalGroup = medicalGroupRepository.findById(request.getMedicalGroupId())
                    .orElseThrow(() -> new IllegalArgumentException("Nhóm chỉ tiêu không tồn tại"));

            CampaignMedicalConfigSub entity = CampaignMedicalConfigSub.builder()
                    .campaignMedicalConfig(campaignConfig)
                    .medicalGroup(medicalGroup)
                    .displayOrder(request.getDisplayOrder())
                    .build();

            entity.setCreatedDate(DateUtils.getNow());
            entity.setCreatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có
            entity.setModifiedDate(DateUtils.getNow());
            entity.setUpdatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có

            return CampaignMedicalConfigSubResponseDTO.fromEntity(
                    configSubRepository.save(entity)
            );
        } catch (Exception e) {
            log.error("Lỗi tạo mới cấu hình nhóm chỉ tiêu", e);
            throw new RuntimeException("Tạo mới cấu hình nhóm chỉ tiêu thất bại: " + e.getMessage());
        }
    }

    /**
     * Cập nhật cấu hình nhóm chỉ tiêu.
     *
     * Phương thức này thực hiện các bước sau:
     * 1. Kiểm tra sự tồn tại của cấu hình nhóm chỉ tiêu.
     * 2. Cập nhật thông tin cấu hình nhóm chỉ tiêu từ request.
     * 3. Trả về DTO chứa thông tin cấu hình nhóm chỉ tiêu sau khi cập nhật.
     *
     * @param id ID của cấu hình nhóm chỉ tiêu cần cập nhật.
     * @param request DTO chứa thông tin yêu cầu cập nhật cấu hình nhóm chỉ tiêu.
     * @return DTO chứa thông tin cấu hình nhóm chỉ tiêu sau khi cập nhật.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public CampaignMedicalConfigSubResponseDTO updateCampaignMedicalConfigSub(Long id, CampaignMedicalConfigSubRequestDTO request) {
        try {
            CampaignMedicalConfigSub entity = configSubRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Cấu hình nhóm chỉ tiêu không tồn tại"));

            entity.setDisplayOrder(request.getDisplayOrder());
            entity.setModifiedDate(DateUtils.getNow());
            entity.setUpdatedBy("ADMIN"); // Thay "ADMIN" bằng người dùng thực tế nếu có

            return CampaignMedicalConfigSubResponseDTO.fromEntity(entity);
        } catch (Exception e) {
            log.error("Lỗi cập nhật cấu hình nhóm chỉ tiêu", e);
            throw new RuntimeException("Cập nhật cấu hình nhóm chỉ tiêu thất bại: " + e.getMessage());
        }
    }

    /** Lấy chi tiết theo ID */
    @Override
    @Transactional(readOnly = true)
    public CampaignMedicalConfigSubResponseDTO getCampaignMedicalConfigSubById(Long id){
        CampaignMedicalConfigSub configSub = configSubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cấu hình nhóm chỉ tiêu không tồn tại"));

        List<MedicalIndicatorResponseDTO> indicatorsResult = getMedicalIndicatorResponseDTOSByMedicalGroupIds(List.of(configSub.getMedicalGroup().getId()));
        CampaignMedicalConfigSubResponseDTO result = CampaignMedicalConfigSubResponseDTO.fromEntity(configSub);
        result.setMedicalIndicators(indicatorsResult);

        return result;
    }

    /** Xóa cấu hình */
    @Override
    public void deleteCampaignMedicalConfigSub(Long id){
        if (!configSubRepository.existsById(id)) {
            throw new IllegalArgumentException("Cấu hình nhóm chỉ tiêu không tồn tại");
        }
        configSubRepository.deleteById(id);
    }

    /**
     * Lấy danh sách cấu hình nhóm chỉ tiêu theo ID của cấu hình đợt khám.
     *
     * Phương thức này thực hiện các bước sau:
     * 1. Truy vấn cấu hình đợt khám dựa trên ID.
     * 2. Lấy danh sách cấu hình nhóm chỉ tiêu liên quan, sắp xếp theo thứ tự hiển thị.
     * 3. Lấy danh sách ID của nhóm chỉ tiêu y tế từ danh sách cấu hình nhóm chỉ tiêu.
     * 4. Chuyển đổi danh sách cấu hình nhóm chỉ tiêu thành danh sách DTO.
     * 5. Lấy danh sách các chỉ tiêu y tế và chỉ tiêu con liên quan đến các nhóm chỉ tiêu.
     * 6. Gắn danh sách chỉ tiêu y tế vào từng DTO của cấu hình nhóm chỉ tiêu tương ứng.
     * 7. Trả về danh sách DTO của cấu hình nhóm chỉ tiêu.
     *
     * @param campaignMedicalConfigId ID của cấu hình đợt khám.
     * @return Danh sách `CampaignMedicalConfigSubResponseDTO` chứa thông tin cấu hình nhóm chỉ tiêu.
     */
    @Override
    public List<CampaignMedicalConfigSubResponseDTO> getByCampaignMedicalConfigId(Long campaignMedicalConfigId){
        CampaignMedicalConfig campaignMedicalConfig = campaignMedicalConfigRepository.findById(campaignMedicalConfigId)
                .orElseThrow(() -> new IllegalArgumentException("Cấu hình đợt khám không tồn tại"));

        List<CampaignMedicalConfigSub> configSubs = configSubRepository.findByCampaignMedicalConfig_IdOrderByDisplayOrderAsc(campaignMedicalConfig.getId());
        List<Long> medicalGroupIds = configSubs.stream()
                .map(sub -> sub.getMedicalGroup().getId())
                .collect(Collectors.toList());

        List<CampaignMedicalConfigSubResponseDTO> result = configSubs.stream()
                .map(CampaignMedicalConfigSubResponseDTO::fromEntity)
                .collect(Collectors.toList());

        List<MedicalIndicatorResponseDTO> indicatorsResult = getMedicalIndicatorResponseDTOSByMedicalGroupIds(medicalGroupIds);
        for(CampaignMedicalConfigSubResponseDTO item : result){
            List<MedicalIndicatorResponseDTO> filteredIndicators = indicatorsResult.stream()
                    .filter(indicator -> indicator.getMedicalGroupId().equals(item.getMedicalGroup().getId()))
                    .collect(Collectors.toList());
            item.setMedicalIndicators(filteredIndicators);
        }

        return result;
    }


    @Override
    public List<CampaignMedicalConfigSubResponseDTO> getByCampaignId(Long campaignId){
        try {
            MedicalCampaign campaign = campaignRepository.findById(campaignId)
                    .orElseThrow(() -> new IllegalArgumentException("Đợt khám không tồn tại"));
            CampaignMedicalConfig campaignMedicalConfig = campaignMedicalConfigRepository.findById(campaign.getCampaignMedicalConfig().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Cấu hình đợt khám không tồn tại"));

            List<CampaignMedicalConfigSub> configSubs = configSubRepository.findByCampaignMedicalConfig_IdOrderByDisplayOrderAsc(campaignMedicalConfig.getId());
            List<Long> medicalGroupIds = configSubs.stream()
                    .map(sub -> sub.getMedicalGroup().getId())
                    .collect(Collectors.toList());

            List<CampaignMedicalConfigSubResponseDTO> result = configSubs.stream()
                    .map(CampaignMedicalConfigSubResponseDTO::fromEntity)
                    .collect(Collectors.toList());

            List<MedicalIndicatorResponseDTO> indicatorsResult = getMedicalIndicatorResponseDTOSByMedicalGroupIds(medicalGroupIds);
            for (CampaignMedicalConfigSubResponseDTO item : result) {
                List<MedicalIndicatorResponseDTO> filteredIndicators = indicatorsResult.stream()
                        .filter(indicator -> indicator.getMedicalGroupId().equals(item.getMedicalGroup().getId()))
                        .collect(Collectors.toList());
                item.setMedicalIndicators(filteredIndicators);
            }

            return result;
        }catch (Exception e){
            log.error("Lỗi lấy cấu hình nhóm chỉ tiêu theo ID đợt khám", e);
            throw new RuntimeException("Lấy cấu hình nhóm chỉ tiêu theo ID đợt khám thất bại: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách các `MedicalIndicatorResponseDTO` dựa trên danh sách ID của nhóm chỉ tiêu y tế.
     *
     * Phương thức này thực hiện các bước sau:
     * 1. Truy vấn danh sách các chỉ tiêu y tế (`MedicalIndicator`) dựa trên danh sách ID nhóm chỉ tiêu.
     * 2. Chuyển đổi danh sách các chỉ tiêu y tế thành danh sách DTO (`MedicalIndicatorResponseDTO`).
     * 3. Truy vấn danh sách các chỉ tiêu con (`MedicalSubIndicator`) dựa trên danh sách ID của các chỉ tiêu y tế.
     * 4. Gắn danh sách các chỉ tiêu con vào từng DTO của chỉ tiêu y tế tương ứng.
     * 5. Trả về danh sách DTO của các chỉ tiêu y tế.
     *
     * @param medicalGroupIds Danh sách ID của nhóm chỉ tiêu y tế.
     * @return Danh sách `MedicalIndicatorResponseDTO` chứa thông tin các chỉ tiêu y tế và chỉ tiêu con.
     */
    private List<MedicalIndicatorResponseDTO> getMedicalIndicatorResponseDTOSByMedicalGroupIds(List<Long> medicalGroupIds) {
        List<MedicalIndicator> indicators = medicalIndicatorRepository.findByGroup_IdIn(medicalGroupIds);

        List<MedicalIndicatorResponseDTO> indicatorsResult = indicators.stream()
                .map(MedicalIndicatorResponseDTO::fromEntity)
                .collect(Collectors.toList());

        List<Long> indicatorIds = indicators.stream()
                .map(MedicalIndicator::getId)
                .collect(Collectors.toList());
        List<MedicalSubIndicator> subIndicators = subIndicatorRepository.findByIndicatorIdIn(indicatorIds);

        for (MedicalIndicatorResponseDTO indicatorDTO : indicatorsResult) {
            List<MedicalSubIndicatorResponseDTO> subIndicatorDTOs = subIndicators.stream()
                    .filter(subIndicator -> subIndicator.getIndicator().getId().equals(indicatorDTO.getId()))
                    .map(MedicalSubIndicatorResponseDTO::fromEntity)
                    .collect(Collectors.toList());
            indicatorDTO.setMedicalSubIndicators(subIndicatorDTOs);
        }
        return indicatorsResult;
    }
}
