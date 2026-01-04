package sk.ytr.modules.dto.excel;

import lombok.*;

@Data
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ExcelMedicalColumn {

    private Long medicalGroupId;
    private String medicalGroupName;

    private Long indicatorId;
    private String indicatorName;

    private Long subIndicatorId; // nullable
    private String subIndicatorName; // nullable

    private Integer columnIndex; // vị trí trong Excel
}
