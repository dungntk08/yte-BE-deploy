package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.CampaignMedicalConfig;

/**
 * Response cấu hình chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigResponseDTO {

    /** ID cấu hình */
    private Long id;

    /** Thứ tự hiển thị */
    private String configName;

    public static CampaignMedicalConfigResponseDTO fromEntity(CampaignMedicalConfig entity) {
        return CampaignMedicalConfigResponseDTO.builder()
                .id(entity.getId())
                .configName(entity.getConfigName())
                .build();
    }
}
