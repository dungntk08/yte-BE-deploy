package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.CampaignMedicalConfigSub;

import java.util.List;

/**
 * Response cấu hình nhóm chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigSubResponseDTO {

    /** ID cấu hình nhóm chỉ tiêu */
    private Long id;

    /** Thông tin nhóm chỉ tiêu khám */
    private MedicalGroupResponseDTO medicalGroup;

    /** ID cấu hình chỉ tiêu khám */
    private Long campaignMedicalConfigId;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Danh sách chỉ tiêu y tế thuộc nhóm */
    private List<MedicalIndicatorResponseDTO> medicalIndicators;

    /**
     * Convert Entity → Response DTO
     */
    public static CampaignMedicalConfigSubResponseDTO fromEntity(
            CampaignMedicalConfigSub entity) {

        return CampaignMedicalConfigSubResponseDTO.builder()
                .id(entity.getId())
                .campaignMedicalConfigId(entity.getCampaignMedicalConfig().getId())
                .medicalGroup(MedicalGroupResponseDTO.fromEntity(entity.getMedicalGroup()))
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
