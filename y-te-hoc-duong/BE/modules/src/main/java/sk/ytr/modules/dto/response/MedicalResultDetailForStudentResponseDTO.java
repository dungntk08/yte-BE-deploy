package sk.ytr.modules.dto.response;

import lombok.*;

import java.util.List;

/**
 * Response thông tin khám sức khỏe cho 1 học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalResultDetailForStudentResponseDTO {
    private Long StudentId;
    private List<MedicalResultDetailResponseDTO> results;
}
