package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.entity.MedicalSubIndicator;

/**
 * Request tạo / chỉnh sửa chỉ tiêu con
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalSubIndicatorRequestDTO {

    /** ID chỉ tiêu cha */
    private Long indicatorId;

    /** Mã chỉ tiêu con */
    private String subCode;

    /** Tên chỉ tiêu con */
    private String subName;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái hoạt động */
    private Boolean isActive;

    /**
     * Convert RequestDTO → Entity
     */
    public MedicalSubIndicator toEntity(MedicalIndicator indicator) {
        return MedicalSubIndicator.builder()
                .indicator(indicator)
                .subCode(this.subCode)
                .subName(this.subName)
                .displayOrder(this.displayOrder)
                .isActive(
                        this.isActive != null ? this.isActive : Boolean.TRUE
                )
                .build();
    }
}
