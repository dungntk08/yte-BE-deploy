package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.MedicalGroup;

/**
 * Response nhóm chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalGroupResponseDTO {

    /** ID nhóm */
    private Long id;

    /** Mã nhóm */
    private String groupCode;

    /** Tên nhóm */
    private String groupName;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái */
    private Boolean isActive;

    public static MedicalGroupResponseDTO fromEntity(MedicalGroup entity) {
        return MedicalGroupResponseDTO.builder()
                .id(entity.getId())
                .groupCode(entity.getGroupCode())
                .groupName(entity.getGroupName())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
