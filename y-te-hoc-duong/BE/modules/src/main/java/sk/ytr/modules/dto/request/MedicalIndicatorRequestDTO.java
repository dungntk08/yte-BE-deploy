package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;

/**
 * Request tạo / chỉnh sửa chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalIndicatorRequestDTO {

    /** ID nhóm chỉ tiêu */
    private Long groupId;

    /** Mã chỉ tiêu */
    private String indicatorCode;

    /** Tên chỉ tiêu */
    private String indicatorName;

    /** Có chỉ tiêu con hay không */
    private Boolean hasSubIndicator;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái hoạt động */
    private Boolean isActive;
}
