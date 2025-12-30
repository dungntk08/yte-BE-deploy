package sk.ytr.modules.dto.response;

import lombok.*;

import java.util.List;

/**
 * Response cấu hình thông tin hiển thị
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalCampaignFilterResponse {
    List<MedicalResultDetailResponseDTO> results;
}
