package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;

/**
 * Request tạo / cập nhật thông tin trường học
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolRequestDTO {

    /** Mã trường theo hệ thống quản lý */
    private String schoolCode;

    /** Tên đầy đủ của trường */
    private String schoolName;

    /** Địa chỉ trường */
    private String address;
}