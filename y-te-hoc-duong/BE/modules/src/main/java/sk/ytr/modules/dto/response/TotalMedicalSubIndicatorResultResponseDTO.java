package sk.ytr.modules.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalMedicalSubIndicatorResultResponseDTO {
    private String subIndicatorName;
    private Long totalCount;
}
