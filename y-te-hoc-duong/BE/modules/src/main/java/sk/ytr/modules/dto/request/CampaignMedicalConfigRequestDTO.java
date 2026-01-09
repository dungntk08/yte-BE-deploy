package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;

/**
 * Request cấu hình chỉ tiêu khám cho đợt khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigRequestDTO {

    /** Thứ tự hiển thị */
    private String configName;
}
