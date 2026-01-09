package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.School;

/**
 * Response thông tin trường học
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolResponseDTO {

    /** ID trường */
    private Long id;

    /** Mã trường */
    private String schoolCode;

    /** Tên trường */
    private String schoolName;

    /** Địa chỉ trường */
    private String address;

    public static SchoolResponseDTO fromEntity(School entity) {
        return SchoolResponseDTO.builder()
                .id(entity.getId())
                .schoolCode(entity.getSchoolCode())
                .schoolName(entity.getSchoolName())
                .address(entity.getAddress())
                .build();
    }
}