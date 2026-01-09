package sk.ytr.modules.dto.excel;

import lombok.*;

@Data
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

    public ExcelMedicalColumn(Long medicalGroupId, String medicalGroupName, Long indicatorId, String indicatorName, Long subIndicatorId, String subIndicatorName, Integer columnIndex) {
        this.medicalGroupId = medicalGroupId;
        this.medicalGroupName = medicalGroupName;
        this.indicatorId = indicatorId;
        this.indicatorName = indicatorName;
        this.subIndicatorId = subIndicatorId;
        this.subIndicatorName = subIndicatorName;
        this.columnIndex = columnIndex;
    }

    public ExcelMedicalColumn() {

    }
}