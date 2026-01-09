package sk.ytr.modules.dto.excel;

import lombok.*;

@Data
@NoArgsConstructor
@Getter
@Setter
public class ExcelMedicalResultDTO {

    private Long studentId;
    private Long medicalGroupId;
    private Long medicalIndicatorId;
    private Long medicalSubIndicatorId;
    private Boolean resultValue;
}