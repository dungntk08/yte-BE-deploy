package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.MedicalSubIndicator;

/**
 * Response chỉ tiêu con
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalSubIndicatorResponseDTO {

    /** ID chỉ tiêu con */
    private Long id;

    /** Mã chỉ tiêu con */
    private String subCode;

    /** Tên chỉ tiêu con */
    private String subName;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái */
    private Boolean isActive;

    public static MedicalSubIndicatorResponseDTO fromEntity(MedicalSubIndicator entity) {
        return MedicalSubIndicatorResponseDTO.builder()
                .id(entity.getId())
                .subCode(entity.getSubCode())
                .subName(entity.getSubName())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
