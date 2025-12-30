package sk.ytr.modules.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request tạo / cập nhật cấu hình nhóm chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigSubRequestDTO {

    /** ID cấu hình chỉ tiêu khám (campaign_medical_config.id) */
    private Long campaignMedicalConfigId;

    /** ID nhóm chỉ tiêu khám (medical_group.id) */
    private Long medicalGroupId;

    /** Thứ tự hiển thị nhóm chỉ tiêu trong đợt khám */
    private Integer displayOrder;

}