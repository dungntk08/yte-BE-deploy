package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.MedicalResultDetail;

/**
 * Response kết quả khám của học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalResultDetailResponseDTO {

    /** ID kết quả */
    private Long id;

    /** ID học sinh */
    private Long studentId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalGroupId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalIndicatorId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalSubIndicatorId;

    /** Giá trị kết quả */
    private Boolean resultValue;

    /** Kết quả Đợt khám mà học sinh tham gia */
    private Long campaignId;

    public static MedicalResultDetailResponseDTO fromEntity(MedicalResultDetail entity) {
        return MedicalResultDetailResponseDTO.builder()
                .id(entity.getId())
                .medicalGroupId(entity.getMedicalGroupId())
                .medicalIndicatorId(entity.getMedicalIndicatorId())
                .medicalSubIndicatorId(entity.getMedicalSubIndicatorId())
                .studentId(entity.getStudent().getId())
                .campaignId(entity.getCampaign().getId())
                .resultValue(entity.getResultValue())
                .build();
    }
}