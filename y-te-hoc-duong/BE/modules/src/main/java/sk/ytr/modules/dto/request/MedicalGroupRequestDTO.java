package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;

/**
 * Request tạo / chỉnh sửa nhóm chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalGroupRequestDTO {

    /** Mã nhóm */
    private String groupCode;

    /** Tên nhóm */
    private String groupName;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái hoạt động */
    private Boolean isActive;
}
