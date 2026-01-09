package sk.ytr.modules.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalMedicalIndicatorResultResponseDTO {
    private String indicatorName;
    private Long totalCount;
    private boolean hasSubIndicators;
    private List<TotalMedicalSubIndicatorResultResponseDTO> subIndicatorResults;
}
